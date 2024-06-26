import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Assets from 'assets';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';

import { BigWinnerCard, Button, Card, CountDown, Leaderboard, Lottie, Modal, Pagination, PurpleBackgroundImage, SmallerDecimal, Table, Tooltip } from 'components';
import { Breakpoints, FirebaseConstants, NavigationConstants } from 'constant';
import { useColorScheme, useWindowSize } from 'hooks';
import { Error404 } from 'pages';
import { Dispatch, RootState } from 'redux/store';
import { LeaderboardItemModel } from 'models';
import { DenomsUtils, Firebase, I18n, WalletUtils, WalletProvidersUtils, NumbersUtils, PoolsUtils } from 'utils';
import { Draw, DrawState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/draw';
import Skeleton from 'react-loading-skeleton';

import DrawDetailsModal from './components/DrawDetailsModal/DrawDetailsModal';

import './PoolDetails.scss';

const PoolDetails = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();
    const navigate = useNavigate();
    const winSizes = useWindowSize();
    const dispatch = useDispatch<Dispatch>();
    const { isDark } = useColorScheme();

    const { lumWallet, prices, pools, pool, biggestPrizes, prizesStats } = useSelector((state: RootState) => ({
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
        pools: state.pools.pools,
        pool: poolId ? state.pools.pools.find((pool) => pool.poolId.toString() === poolId) : state.pools.pools.find((pool) => pool.nativeDenom === 'u' + denom),
        biggestPrizes: state.prizes.prizes,
        prizesStats: state.prizes.stats,
    }));

    const loadingFetchPools = useSelector((state: RootState) => state.loading.effects.pools.fetchPools);
    const loadingAdditionalInfo = useSelector((state: RootState) => state.loading.effects.pools.getPoolsAdditionalInfo);

    const [estimationAmount, setEstimationAmount] = useState('100');
    const [estimatedChances, setEstimatedChances] = useState(0);
    const [drawsHistoryPage, setDrawsHistoryPage] = useState(1);
    const [smallDrawsHistoryVisibleItem, setSmallDrawsHistoryVisibleItem] = useState(0);
    const [drawInProgress, setDrawInProgress] = useState(false);
    const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
    const [poolDraws, setPoolDraws] = useState<Draw[]>([]);
    const [userRankItems, setUserRankItems] = useState<LeaderboardItemModel[] | undefined>();

    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    useEffect(() => {
        dispatch.prizes.fetchPrizes({ page: 0, poolId: poolId });
        dispatch.prizes.getStats(poolId || '');

        if (pool && pool.draws && pool.draws.length > 0) {
            setPoolDraws(pool.draws.filter((draw) => draw.errorState === DrawState.DRAW_STATE_UNSPECIFIED));
        }
    }, [poolId, denom]);

    useEffect(() => {
        const getLeaderboard = async () => {
            if (pool && lumWallet) {
                const userRankItems = await dispatch.wallet.getLeaderboardRank(pool.poolId);

                setUserRankItems(userRankItems && userRankItems.length > 0 ? [...userRankItems] : undefined);
            } else {
                setUserRankItems(undefined);
            }
        };

        getLeaderboard().finally(() => null);
    }, [lumWallet]);

    useEffect(() => {
        if (pool) {
            const estimationAmountNumber = Number(estimationAmount);
            const chances = PoolsUtils.getWinningChances(estimationAmountNumber, pool, prices);
            setEstimatedChances(chances);
        }
    }, [estimationAmount]);

    if (!pool || !denom) {
        return <Error404 />;
    }

    const prizes = pool.prizeStrategy?.prizeBatches.map((prizeBatch) => ({
        count: Number(prizeBatch.quantity),
        chances: Number(prizeBatch.drawProbability),
        value: (pool.estimatedPrizeToWin?.amount || 0) * (Number(prizeBatch.poolPercent) / 100) * prices[denom],
    }));

    const drawHistoryHeaders = I18n.t('poolDetails.drawsHistory.tableHeaders', { returnObjects: true });
    const prizeDistributionHeaders = I18n.t('poolDetails.prizeDistribution.tableHeaders', { returnObjects: true });

    const sponsorshipAmount = NumbersUtils.convertUnitNumber(pool.sponsorshipAmount, pool.nativeDenom);
    const usersDepositsAmount = NumbersUtils.convertUnitNumber(pool.tvlAmount || '0', pool.nativeDenom) - sponsorshipAmount;

    const userDeposits = lumWallet?.deposits.find((deposit) => (poolId ? Number(deposit.poolId) === Number(poolId) : deposit.amount?.denom === 'u' + denom));
    const avgDeposit = (usersDepositsAmount / Number(pool.depositorsCount)) * (prices[denom] ?? 0);

    return (
        <div className='pool-details-container mt-5'>
            <Card className='glow-bg'>
                <button
                    type='button'
                    onClick={() => navigate(NavigationConstants.POOLS)}
                    className='d-none close-btn bg-transparent rounded-circle d-xl-flex align-self-end justify-content-center align-items-center border-0 position-absolute top-0 end-0 mt-3 me-3'
                    aria-label='Close'
                >
                    <div className={`btn-close ${isDark ? 'btn-close-white' : ''}`} />
                </button>
                <div className='d-flex flex-column flex-xl-row justify-content-between align-items-xl-center'>
                    <div className='d-flex flex-row align-items-center me-0 me-xxl-5'>
                        <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} className='pool-icon no-filter' />
                        <h1 className='mb-0 ms-3 ms-md-4 text-nowrap'>
                            {denom.toUpperCase()} {I18n.t('common.pool')} {pools.filter((pool) => pool.nativeDenom === 'u' + denom).length > 1 ? `#${pool.poolId.toString()}` : ''}
                        </h1>
                    </div>
                    <div className='d-flex flex-column flex-lg-row justify-content-between flex-grow-1 ms-0 ms-xl-5 mt-4 mt-xl-0'>
                        <div className='d-flex flex-row align-items-center'>
                            <PurpleBackgroundImage alt='dollar' src={Assets.images.dollarWhite} className='no-filter' height={42} width={42} />
                            <div className='d-flex flex-column align-items-start justify-content-center ms-3'>
                                <h4 className='mb-0 text-nowrap'>{I18n.t('poolDetails.variableAPY')}</h4>
                                {loadingFetchPools || loadingAdditionalInfo ? (
                                    <Skeleton height={20} width={70} />
                                ) : (
                                    <div className='total-value-locked text-nowrap'>{pool.apy ? numeral(pool.apy).format('0,0[.]00') : '--'}%</div>
                                )}
                            </div>
                        </div>
                        <div className='d-flex flex-row my-4 my-lg-0 align-items-center'>
                            <PurpleBackgroundImage alt='coin stacked' src={Assets.images.coinsStacked2} className='no-filter' height={42} width={42} />
                            <div className='d-flex flex-column align-items-start justify-content-center ms-3'>
                                <h4 className='mb-0 text-nowrap'>{I18n.t('home.totalValueLocked')}</h4>
                                <div className='total-value-locked text-nowrap'>${numeral(NumbersUtils.convertUnitNumber(pool.tvlAmount, pool.nativeDenom) * (prices[denom] || 1)).format('0,0')}</div>
                            </div>
                        </div>
                        <Button
                            {...(WalletProvidersUtils.isAnyWalletInstalled() && lumWallet === null
                                ? {
                                      'data-bs-target': '#choose-wallet-modal',
                                      'data-bs-toggle': 'modal',
                                  }
                                : !WalletProvidersUtils.isAnyWalletInstalled()
                                ? {
                                      'data-bs-target': '#get-keplr-modal',
                                      'data-bs-toggle': 'modal',
                                  }
                                : {
                                      to: `${NavigationConstants.POOLS}/${denom}/${poolId || pool.poolId.toString()}`,
                                  })}
                            className='deposit-btn'
                            forcePurple
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSIT_CLICK, { denom: denom })}
                        >
                            {I18n.t('mySavings.deposit')}
                        </Button>
                    </div>
                </div>
                <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between position-relative prize-draw-card'>
                    <div className='biggest-prize-container d-flex flex-column mb-4 mb-lg-0'>
                        <div className='d-flex align-items-center'>
                            <h2 className='mb-0'>{I18n.t('poolDetails.prizePool')}</h2>
                            <span
                                data-tooltip-id='prize-pool-tooltip'
                                data-tooltip-html={I18n.t('poolDetails.prizePoolHint', {
                                    prizePool: Math.round(pool.currentPrizeToWin?.amount || 0),
                                    denom: denom.toUpperCase(),
                                    prizePoolInUsd: Math.round((pool.currentPrizeToWin?.amount || 0) * (prices[denom] || 1)),
                                })}
                                className='ms-2 mb-2'
                            >
                                <img src={Assets.images.info} alt='info' className='purple-filter' />
                                <Tooltip id='prize-pool-tooltip' />
                            </span>
                        </div>
                        {loadingFetchPools || loadingAdditionalInfo ? (
                            <Skeleton height={45} width={180} />
                        ) : (
                            <div className='display-6 estimated-prize-usd'>
                                {pool.estimatedPrizeToWin && prices ? numeral(pool.estimatedPrizeToWin.amount * (prices[denom] || 1)).format('$0,0') : '--'}
                            </div>
                        )}
                        {loadingFetchPools || loadingAdditionalInfo ? (
                            <Skeleton height={20} width={150} />
                        ) : (
                            <div className='d-flex estimated-prize'>
                                {pool.estimatedPrizeToWin && winSizes.width < Breakpoints.SM ? (
                                    numeral(pool.estimatedPrizeToWin.amount).format('0[.]0a')
                                ) : (
                                    <SmallerDecimal nb={pool.estimatedPrizeToWin ? numeral(pool.estimatedPrizeToWin.amount).format('0,0.000000') : '--'} />
                                )}
                                &nbsp;{denom.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className='d-flex flex-column next-draw-container'>
                        <h2 className='mb-0'>{I18n.t('poolDetails.nextDraw')}</h2>
                        <div className={`display-6 next-draw ${drawInProgress ? 'draw-in-progress' : 'text-break'}`}>
                            {drawInProgress ? I18n.t('common.drawInProgress') : <CountDown to={pool.nextDrawAt || new Date()} onCountdownEnd={() => setDrawInProgress(true)} />}
                        </div>
                    </div>
                    <div
                        style={{
                            background: 'transparent',
                            width: '232px',
                            height: '1px',
                        }}
                    />
                    {pool.internalInfos?.illustration && <img alt='' src={pool.internalInfos.illustration} className='d-none d-sm-block pool-illustration no-filter' />}
                </Card>
                {(usersDepositsAmount > 0 || sponsorshipAmount > 0) && (
                    <>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.tvlDetails.title')}</h2>
                        <Card flat withoutPadding className='d-flex flex-column tvl-details-card'>
                            {sponsorshipAmount > 0 && (
                                <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 tvl-detail-card'>
                                    <div className='d-flex flex-row align-items-center'>
                                        <PurpleBackgroundImage alt='sponsor' src={Assets.images.sponsor} className='d-none d-sm-block me-3 no-filter' width={50} height={50} />
                                        <div>
                                            <h4 className='mb-0'>{I18n.t('poolDetails.tvlDetails.sponsor')}</h4>
                                            <p className='mb-0' dangerouslySetInnerHTML={{ __html: I18n.t('poolDetails.tvlDetails.sponsorDesc') }} />
                                        </div>
                                    </div>
                                    <div className='d-flex flex-column justify-content-md-end text-md-end mt-3 mt-md-0'>
                                        <div className='tvl-detail-amount'>
                                            {numeral(sponsorshipAmount)
                                                .format(winSizes.width < Breakpoints.SM ? '0,0a' : '0,0')
                                                .toUpperCase()}{' '}
                                            <span className='denom'>{DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()}</span>
                                        </div>
                                        <small className='usd-amount'>{numeral(sponsorshipAmount * (prices[DenomsUtils.getNormalDenom(pool.nativeDenom)] || 0)).format('$0,0[.]00')}</small>
                                    </div>
                                </div>
                            )}
                            <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center tvl-detail-card'>
                                <div className='d-flex flex-row align-items-center'>
                                    <PurpleBackgroundImage alt='deposit' src={Assets.images.tvlDeposit} className='d-none d-sm-block me-3 no-filter' width={50} height={50} style={{ padding: 4 }} />
                                    <h4 className='mb-0'>{I18n.t('poolDetails.tvlDetails.deposits')}</h4>
                                </div>
                                <div className='d-flex flex-column justify-content-md-end text-md-end mt-3 mt-md-0'>
                                    <div className='tvl-detail-amount'>
                                        {numeral(usersDepositsAmount)
                                            .format(winSizes.width < Breakpoints.SM ? '0[.]0a' : '0,0')
                                            .toUpperCase()}{' '}
                                        <span className='denom'>{DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()}</span>
                                    </div>
                                    <small className='usd-amount'>{numeral(usersDepositsAmount * (prices[DenomsUtils.getNormalDenom(pool.nativeDenom)] || 0)).format('$0,0[.]00')}</small>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
                {userDeposits && (
                    <>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.myDeposits', { denom: denom.toUpperCase() })}</h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row align-items-lg-center justify-content-between my-deposits-card'>
                            <div className='d-flex flex-row align-items-center mb-4 mb-lg-0'>
                                <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} width='50' height='50' className='d-none d-sm-block me-4 no-filter' />
                                <div>
                                    <h3 className='mb-0'>
                                        {I18n.t('common.deposit')}
                                        {userDeposits.deposits.length > 1 ? 's' : ` #${userDeposits.depositId?.toString()}`}
                                    </h3>
                                    <span className='user-deposit-amount'>
                                        <SmallerDecimal
                                            nb={NumbersUtils.formatTo6digit(
                                                userDeposits.deposits.reduce((acc, deposit) => acc + NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0', pool.nativeDenom), 0),
                                            )}
                                        />{' '}
                                        {denom.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <Button outline to={NavigationConstants.MY_SAVINGS}>
                                {I18n.t('poolDetails.viewDetails')}
                            </Button>
                        </Card>
                    </>
                )}
                <div className='row row-cols-1 row-cols-xl-2'>
                    {prizes && (
                        <div className='col position-relative'>
                            <div className='mb-2 mb-lg-4 mt-4 mt-lg-5 d-flex align-items-center'>
                                <h2 className='mb-0'>{I18n.t('poolDetails.prizeDistribution.title')}</h2>
                                <span data-tooltip-id='prize-distribution-tooltip' data-tooltip-html={I18n.t('poolDetails.prizeDistribution.hint')} className='ms-2 mb-2'>
                                    <img src={Assets.images.info} alt='info' className='purple-filter' />
                                    <Tooltip id='prize-distribution-tooltip' />
                                </span>
                            </div>
                            <Card flat withoutPadding className='prize-distribution-card'>
                                <Table headers={prizeDistributionHeaders} className='prize-distribution-table'>
                                    {prizes.map((prize, index) => (
                                        <tr key={`prize-${index}`} className={'rank' + ' ' + (index + 1 === 1 ? 'first' : index + 1 === 2 ? 'second' : index + 1 === 3 ? 'third' : '')}>
                                            <td data-label={prizeDistributionHeaders[0]}>
                                                <div className='d-flex flex-column'>
                                                    <div className='prize-value'>{numeral(prize.value / prize.count).format('$0,0[.]00')}</div>
                                                    <div className='percentage'>{I18n.t('poolDetails.prizeDistribution.chancesToWin', { percentage: numeral(prize.chances).format('0,0[.]00%') })}</div>
                                                </div>
                                            </td>
                                            <td className='text-end prize-count' data-label={prizeDistributionHeaders[1]}>
                                                {prize.count}
                                            </td>
                                        </tr>
                                    ))}
                                </Table>
                            </Card>
                            <Lottie
                                className='d-none d-sm-block cosmonaut-with-duck'
                                animationData={cosmonautWithDuck}
                                segments={[
                                    [0, 30],
                                    [30, 128],
                                ]}
                            />
                        </div>
                    )}
                    <div className='col'>
                        <div className='h-100'>
                            <div className='mb-2 mb-lg-4 mt-4 mt-lg-5 d-flex align-items-center'>
                                <h2 className='mb-0'>{I18n.t('poolDetails.winningChances.title')}</h2>
                                <span data-tooltip-id='winning-chance-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')} className='ms-2 mb-2'>
                                    <img src={Assets.images.info} alt='info' className='purple-filter' />
                                    <Tooltip id='winning-chance-tooltip' />
                                </span>
                            </div>
                            <Card flat withoutPadding className='winning-chances-card d-flex flex-column justify-content-between h-auto'>
                                <div>
                                    <small className='sub-title'>{I18n.t('poolDetails.winningChances.estimatedSavings')}</small>
                                    <div className='d-flex flex-column mt-2'>
                                        <div className='estimation-input-container d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-2 px-4'>
                                            <div className='d-flex flex-row align-items-center me-0 me-sm-3'>
                                                $
                                                <input
                                                    type='text'
                                                    className='w-100'
                                                    value={estimationAmount}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9\.]/, '');
                                                        setEstimationAmount(val);
                                                    }}
                                                />
                                            </div>
                                            {estimationAmount && (
                                                <div className='crypto-amount text-nowrap'>
                                                    {numeral(Number(estimationAmount) / (prices[denom] || 1))
                                                        .format(winSizes.width < Breakpoints.SM ? '0[.]0a' : '0,0[.]00')
                                                        .toUpperCase()}{' '}
                                                    {denom.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3'>
                                            {[10, 100, 1000, 10000].map((amount, index) => {
                                                const numValue = Number(estimationAmount);
                                                return (
                                                    <button
                                                        type='button'
                                                        key={`estimation-for-${amount}`}
                                                        className={`d-flex align-items-center justify-content-center py-1 w-100 selectable-btn ${index > 0 ? 'ms-0 ms-sm-3 mt-3 mt-sm-0' : ''} ${
                                                            numValue.toFixed() === amount.toFixed() ? 'active' : ''
                                                        }`}
                                                        onClick={() => setEstimationAmount(amount.toFixed())}
                                                    >
                                                        {numeral(amount).format('$0,0')}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-3 mt-xl-5'>
                                    <small className='sub-title'>{I18n.t('poolDetails.winningChances.chanceToWin')}</small>
                                    <div className='chance-to-win mt-2 stat-bg-white'>{NumbersUtils.float2ratio(estimatedChances)}</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                {pool.leaderboard.items.length > 0 && (
                    <div className='row'>
                        <div className='col-12 overflow-visible'>
                            <div className='d-flex align-items-center mt-4 mt-lg-5 mb-2 mb-lg-4'>
                                <h2 className='mb-0'>{I18n.t('mySavings.depositorsRanking')}</h2>
                                <span data-tooltip-id='depositor-ranking-hint' data-tooltip-html={I18n.t('leaderboard.hint')} className='ms-2 mb-2'>
                                    <img src={Assets.images.info} alt='info' className='purple-filter' />
                                    <Tooltip id='depositor-ranking-hint' />
                                </span>
                            </div>
                            <Leaderboard
                                flat
                                pool={pool}
                                limit={5}
                                withSeeMoreBtn
                                lumWallet={lumWallet}
                                price={prices[denom || '']}
                                totalDeposited={WalletUtils.getTotalBalanceFromDeposits(lumWallet?.deposits)}
                                userRank={
                                    userRankItems && userRankItems[1].rank > 4
                                        ? {
                                              ...userRankItems[1],
                                              prev: userRankItems[0],
                                              next: userRankItems[2],
                                          }
                                        : undefined
                                }
                            />
                        </div>
                    </div>
                )}
                <div className='row position-relative'>
                    <div className='col-12 col-xl-4'>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.users.title')}</h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row align-items-lg-center p-4'>
                            <div className='w-100 me-3'>
                                <small className='sub-title'>{I18n.t('poolDetails.users.deposit')}</small>
                                <div className='stat-bg-white mb-0 mt-2'>${pool ? numeral(avgDeposit).format('0,0') : 0}</div>
                            </div>
                            <div className='w-100 mt-4 mt-lg-0'>
                                <small className='sub-title'>{I18n.t('poolDetails.users.currentDraw')}</small>
                                <div className='stat-bg-white mb-0 mt-2'>{pool?.depositorsCount.toString() || 0}</div>
                            </div>
                        </Card>
                    </div>
                    <div className='col-12 col-xl-7'>
                        {!!prizesStats && (
                            <>
                                <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1 no-filter' width='28' />
                                    {I18n.t('poolDetails.winners.title')}
                                </h2>
                                <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between align-items-lg-center p-4'>
                                    <div className='w-100'>
                                        <small className='sub-title'>{I18n.t('poolDetails.winners.totalPrizes')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>{numeral(prizesStats.totalPrizesAmount * (prices[denom] ?? 0)).format('$0,0')}</div>
                                    </div>
                                    <div className='w-100 my-4 my-lg-0 mx-0 mx-lg-3'>
                                        <small className='sub-title'>{I18n.t('poolDetails.winners.totalPoolPrizes')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>{numeral(prizesStats.totalPoolPrizes).format('0,0')}</div>
                                    </div>
                                    <div className='w-100'>
                                        <small className='sub-title'>{I18n.t('poolDetails.winners.bestPrizeWon')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>
                                            {numeral(NumbersUtils.convertUnitNumber(prizesStats.biggestPrizeAmount, pool.nativeDenom) * (prices[denom] ?? 0))
                                                .format('$0,0.00')
                                                .toUpperCase()}
                                        </div>
                                    </div>
                                </Card>
                            </>
                        )}
                    </div>
                    <Lottie
                        className='d-none d-sm-block cosmonaut-with-balloons'
                        animationData={cosmonautWithBalloons}
                        segments={[
                            [0, 30],
                            [30, 128],
                        ]}
                    />
                </div>
                {!!biggestPrizes.length && (
                    <>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('luckiestWinners.title')}</h2>
                        <div className='d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center mt-3'>
                            {biggestPrizes.slice(0, 3).map((prize, index) => (
                                <BigWinnerCard
                                    className={index > 0 ? 'ms-lg-3' : ''}
                                    price={prices[DenomsUtils.getNormalDenom(prize.amount.denom)] ?? 0}
                                    key={index}
                                    denom={prize.amount.denom}
                                    address={prize.winnerAddress}
                                    prize={prize.amount.amount}
                                />
                            ))}
                        </div>
                    </>
                )}
                {poolDraws && poolDraws.length > 0 && (
                    <div className='row'>
                        <div className='col-12'>
                            <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.drawsHistory.title')}</h2>
                            <Card flat withoutPadding className='draws-history-card'>
                                {winSizes.width < Breakpoints.MD ? (
                                    <>
                                        <div
                                            className='d-flex flex-column'
                                            onClick={() => {
                                                if (poolDraws) {
                                                    setSelectedDraw(poolDraws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]);
                                                    modalRef.current?.show();
                                                }
                                            }}
                                        >
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[0]}</label>
                                                <div className='stat-bg-white'>
                                                    <div className='d-flex align-items-center justify-content-center index-container'>
                                                        #{poolDraws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.drawId.toString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[1]}</label>
                                                <div className='stat-bg-white'>
                                                    <div className='draw-date'>
                                                        {dayjs(poolDraws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.createdAt).format('DD MMM YYYY - hh:mmA')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-column my-3'>
                                                <label>{drawHistoryHeaders[2]}</label>
                                                <div className='stat-bg-white'>{poolDraws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.totalWinCount.toString()}</div>
                                            </div>
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[3]}</label>
                                                <div className='stat-bg-white'>
                                                    <SmallerDecimal
                                                        nb={numeral(
                                                            NumbersUtils.convertUnitNumber(
                                                                poolDraws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.totalWinAmount || '0',
                                                                pool.nativeDenom,
                                                            ) * (prices[denom] || 1),
                                                        ).format('$0,0[.]00')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='d-flex flex-row mt-4'>
                                            <button
                                                type='button'
                                                className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn'
                                                disabled={smallDrawsHistoryVisibleItem === 0 && drawsHistoryPage === 1}
                                                onClick={() => {
                                                    if (smallDrawsHistoryVisibleItem === 0) {
                                                        setDrawsHistoryPage(drawsHistoryPage - 1);
                                                        setSmallDrawsHistoryVisibleItem(4);
                                                    } else {
                                                        setSmallDrawsHistoryVisibleItem(smallDrawsHistoryVisibleItem - 1);
                                                    }
                                                }}
                                            >
                                                {I18n.t('common.prev')}
                                            </button>
                                            <button
                                                type='button'
                                                className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn ms-4'
                                                disabled={(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem === poolDraws.length - 1}
                                                onClick={() => {
                                                    if (smallDrawsHistoryVisibleItem === 4) {
                                                        setDrawsHistoryPage(drawsHistoryPage + 1);
                                                        setSmallDrawsHistoryVisibleItem(0);
                                                    } else {
                                                        setSmallDrawsHistoryVisibleItem(smallDrawsHistoryVisibleItem + 1);
                                                    }
                                                }}
                                            >
                                                {I18n.t('common.next')}
                                            </button>
                                        </div>
                                        <Pagination
                                            customPagination='draws-history-pagination mt-4 justify-content-center'
                                            pagination={{
                                                page: drawsHistoryPage,
                                                hasPreviousPage: drawsHistoryPage > 1,
                                                hasNextPage: drawsHistoryPage < Math.ceil(poolDraws.length / 5),
                                                pagesTotal: Math.ceil(poolDraws.length / 5),
                                            }}
                                            onPageChange={(page) => {
                                                setSmallDrawsHistoryVisibleItem(0);
                                                setDrawsHistoryPage(page);
                                            }}
                                        />
                                    </>
                                ) : (
                                    <Table
                                        className='draws-history-table w-100'
                                        headers={drawHistoryHeaders}
                                        responsive={winSizes.width <= Breakpoints.SM}
                                        pagination={
                                            poolDraws.length > 5
                                                ? {
                                                      page: drawsHistoryPage,
                                                      pagesTotal: Math.ceil(poolDraws.length / 5),
                                                      hasNextPage: drawsHistoryPage < Math.ceil(poolDraws.length / 5),
                                                      hasPreviousPage: drawsHistoryPage > 1,
                                                  }
                                                : undefined
                                        }
                                        customPagination='draws-history-pagination'
                                        onPageChange={(page) => setDrawsHistoryPage(page)}
                                    >
                                        {poolDraws.slice((drawsHistoryPage - 1) * 5, (drawsHistoryPage - 1) * 5 + 5).map((draw, index) => {
                                            return (
                                                <tr
                                                    key={`draw-${index}`}
                                                    onClick={() => {
                                                        setSelectedDraw(draw);
                                                        modalRef.current?.show();
                                                    }}
                                                    className='scale-hover'
                                                >
                                                    <td data-label={drawHistoryHeaders[1]}>
                                                        <div className='d-flex align-items-center justify-content-center me-0 me-md-3 ms-auto ms-md-0 index-container'>#{draw.drawId.toString()}</div>
                                                    </td>
                                                    <td data-label={drawHistoryHeaders[2]}>
                                                        <div className='draw-date mt-2'>{dayjs(draw.createdAt).format('DD MMM YYYY - hh:mmA')}</div>
                                                    </td>
                                                    <td data-label={drawHistoryHeaders[3]} className='text-end'>
                                                        {draw.totalWinCount.toString()}
                                                    </td>
                                                    <td data-label={drawHistoryHeaders[4]} className='text-end'>
                                                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(draw.totalWinAmount, pool.nativeDenom)).format('0,0.000000')} />
                                                        &nbsp;
                                                        {denom.toUpperCase()}
                                                        <div className='draw-token'>
                                                            <SmallerDecimal
                                                                nb={numeral(NumbersUtils.convertUnitNumber(draw.totalWinAmount, pool.nativeDenom) * (prices[denom] ?? 0)).format('$0,0[.]00')}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </Table>
                                )}
                            </Card>
                        </div>
                    </div>
                )}
                <Lottie
                    className='cosmonaut-dab mx-auto'
                    animationData={cosmonautDab}
                    actions={[
                        {
                            visibility: [0, 0.05],
                            type: 'stop',
                            frames: [0],
                        },
                        {
                            visibility: [0.05, 0.2],
                            type: 'seek',
                            frames: [0, 30],
                        },
                    ]}
                />
            </Card>
            <DrawDetailsModal draw={selectedDraw} poolDenom={pool.nativeDenom} prices={prices} modalRef={modalRef} />
        </div>
    );
};

export default PoolDetails;
