import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Draw } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/draw';

import Assets from 'assets';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';

import { BigWinnerCard, Button, Card, CountDown, Lottie, Modal, Pagination, SmallerDecimal, Table, Tooltip } from 'components';
import { ApiConstants, Breakpoints, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { Error404 } from 'pages';
import { Dispatch, RootState } from 'redux/store';
import { DenomsUtils, I18n, KeplrUtils, NumbersUtils, PoolsUtils } from 'utils';
import Skeleton from 'react-loading-skeleton';

import DrawDetailsModal from './components/DrawDetailsModal/DrawDetailsModal';

import './PoolDetails.scss';

const PoolDetails = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();
    const navigate = useNavigate();
    const winSizes = useWindowSize();
    const dispatch = useDispatch<Dispatch>();

    const { lumWallet, prices, pools, pool, biggestPrizes, prizesStats } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
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

    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    useEffect(() => {
        dispatch.prizes.fetchPrizes({ page: 0, denom: denom });
        dispatch.prizes.getStats(denom || '');
    }, [poolId, denom]);

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
        count: prizeBatch.quantity.toNumber(),
        chances: parseInt(prizeBatch.drawProbability) / ApiConstants.CLIENT_PRECISION,
        value: (pool.estimatedPrizeToWin?.amount || 0) * (prizeBatch.poolPercent.toNumber() / 100) * prices[denom],
    }));

    const drawHistoryHeaders = I18n.t('poolDetails.drawsHistory.tableHeaders', { returnObjects: true });
    const prizeDistributionHeaders = I18n.t('poolDetails.prizeDistribution.tableHeaders', { returnObjects: true });

    const sponsorshipAmount = NumbersUtils.convertUnitNumber(pool.sponsorshipAmount);
    const usersDepositsAmount = NumbersUtils.convertUnitNumber(pool.tvlAmount || '0') - sponsorshipAmount;

    const userDeposits = lumWallet?.deposits.find((deposit) => (poolId ? deposit.poolId?.equals(poolId) : deposit.amount?.denom === 'u' + denom));
    const avgDeposit = (usersDepositsAmount / pool.depositorsCount.toNumber()) * prices[denom] || 0;

    return (
        <div className='pool-details-container mt-5'>
            <Card className='glow-bg'>
                <button
                    type='button'
                    onClick={() => navigate(NavigationConstants.POOLS)}
                    className='d-none close-btn bg-transparent rounded-circle d-xl-flex align-self-end justify-content-center align-items-center border-0 position-absolute top-0 end-0 mt-3 me-3'
                    aria-label='Close'
                >
                    <div className='btn-close' />
                </button>
                <div className='d-flex flex-column flex-xl-row justify-content-between align-items-xl-center'>
                    <div className='d-flex flex-row align-items-center me-0 me-xxl-5'>
                        <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} className='pool-icon' />
                        <h1 className='mb-0 ms-3 ms-md-4 text-nowrap'>
                            {denom.toUpperCase()} {I18n.t('common.pool')} {pools.filter((pool) => pool.nativeDenom === 'u' + denom).length > 1 ? `#${pool.poolId.toString()}` : ''}
                        </h1>
                    </div>
                    <div className='d-flex flex-column flex-lg-row justify-content-between flex-grow-1 ms-0 ms-xl-5 mt-4 mt-xl-0'>
                        <div className='d-flex flex-row'>
                            <img alt='coin staked' src={Assets.images.coinsStaked2} />
                            <div className='d-flex flex-column align-items-start justify-content-center ms-3'>
                                <h4 className='mb-0 text-nowrap'>{I18n.t('poolDetails.variableAPY')}</h4>
                                {loadingFetchPools || loadingAdditionalInfo ? (
                                    <Skeleton height={20} width={70} />
                                ) : (
                                    <div className='total-value-locked text-nowrap'>{pool.apy ? numeral(pool.apy).format('0,0[.]00') : '--'}%</div>
                                )}
                            </div>
                        </div>
                        <div className='d-flex flex-row my-4 my-lg-0'>
                            <img alt='coin staked' src={Assets.images.coinsStaked2} />
                            <div className='d-flex flex-column align-items-start justify-content-center ms-3'>
                                <h4 className='mb-0 text-nowrap'>{I18n.t('home.totalValueLocked')}</h4>
                                <div className='total-value-locked text-nowrap'>${numeral(NumbersUtils.convertUnitNumber(pool.tvlAmount) * (prices[denom] || 1)).format('0,0')}</div>
                            </div>
                        </div>
                        <Button
                            disabled={KeplrUtils.isKeplrInstalled() && lumWallet === null}
                            {...(!KeplrUtils.isKeplrInstalled()
                                ? {
                                      'data-bs-target': '#get-keplr-modal',
                                      'data-bs-toggle': 'modal',
                                  }
                                : {
                                      to: `${NavigationConstants.POOLS}/${denom}/${poolId || pool.poolId.toString()}`,
                                  })}
                            className='deposit-btn'
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
                                data-tooltip-id='winning-chance-tooltip'
                                data-tooltip-html={I18n.t('poolDetails.prizePoolHint', {
                                    prizePool: Math.round(pool.currentPrizeToWin?.amount || 0),
                                    denom: denom.toUpperCase(),
                                    prizePoolInUsd: Math.round((pool.currentPrizeToWin?.amount || 0) * (prices[denom] || 1)),
                                })}
                                className='ms-2 mb-2'
                            >
                                <img src={Assets.images.info} alt='info' />
                                <Tooltip id='winning-chance-tooltip' />
                            </span>
                        </div>
                        {loadingFetchPools || loadingAdditionalInfo ? (
                            <Skeleton height={45} width={180} />
                        ) : (
                            <div className='display-6'>{pool.estimatedPrizeToWin && prices ? numeral(pool.estimatedPrizeToWin.amount * (prices[denom] || 1)).format('$0,0') : '--'}</div>
                        )}
                        {loadingFetchPools || loadingAdditionalInfo ? (
                            <Skeleton height={20} width={150} />
                        ) : (
                            <>
                                {pool.estimatedPrizeToWin ? numeral(pool.estimatedPrizeToWin.amount).format('0,0') : '--'} {denom.toUpperCase()}
                            </>
                        )}
                    </div>
                    <div className='next-draw-container'>
                        <h2 className='mb-0'>{I18n.t('poolDetails.nextDraw')}</h2>
                        <div className={`display-6 ${drawInProgress ? 'draw-in-progress' : ''}`}>
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
                    {pool.internalInfos?.illustration && <img alt='' src={pool.internalInfos.illustration} className='d-none d-sm-block pool-illustration' />}
                </Card>
                {(usersDepositsAmount > 0 || sponsorshipAmount > 0) && (
                    <>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.tvlDetails.title')}</h2>
                        <Card flat withoutPadding className='d-flex flex-column tvl-details-card'>
                            {sponsorshipAmount > 0 && (
                                <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 tvl-detail-card'>
                                    <div className='d-flex flex-row align-items-center'>
                                        <img src={Assets.images.sponsor} className='me-3' />
                                        <h4 className='mb-0'>{I18n.t('poolDetails.tvlDetails.sponsor')}</h4>
                                    </div>
                                    <div className='d-flex flex-column justify-content-md-end text-md-end mt-3 mt-md-0'>
                                        <div className='tvl-detail-amount'>
                                            {numeral(sponsorshipAmount).format('0,0')} <span className='denom'>{DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()}</span>
                                        </div>
                                        <small className='usd-amount'>{numeral(sponsorshipAmount * (prices[DenomsUtils.getNormalDenom(pool.nativeDenom)] || 0)).format('$0,0[.]00')}</small>
                                    </div>
                                </div>
                            )}
                            <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center tvl-detail-card'>
                                <div className='d-flex flex-row align-items-center'>
                                    <img src={Assets.images.sponsor} className='me-3' />
                                    <h4 className='mb-0'>{I18n.t('poolDetails.tvlDetails.deposits')}</h4>
                                </div>
                                <div className='d-flex flex-column justify-content-md-end text-md-end mt-3 mt-md-0'>
                                    <div className='tvl-detail-amount'>
                                        {numeral(usersDepositsAmount).format('0,0')} <span className='denom'>{DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()}</span>
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
                                <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} width='50' height='50' className='d-none d-sm-block me-4' />
                                <div>
                                    <h3 className='mb-0'>
                                        {I18n.t('common.deposit')}
                                        {userDeposits.deposits.length > 1 ? 's' : ` #${userDeposits.depositId?.toString()}`}
                                    </h3>
                                    {NumbersUtils.formatTo6digit(userDeposits.deposits.reduce((acc, deposit) => acc + NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0'), 0))}{' '}
                                    {denom.toUpperCase()}
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
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='prize-distribution-tooltip' />
                                </span>
                            </div>
                            {winSizes.width > Breakpoints.LG ? (
                                <Card flat withoutPadding className='prize-distribution-card'>
                                    <Table headers={prizeDistributionHeaders} className='prize-distribution-table'>
                                        {prizes.map((prize, index) => (
                                            <tr key={`prize-${index}`} className='stat-bg-white'>
                                                <td data-label={prizeDistributionHeaders[0]}>{numeral(prize.value / prize.count).format('$0,0[.]00')}</td>
                                                <td data-label={prizeDistributionHeaders[1]}>{prize.count}</td>
                                                <td className='text-end' data-label={prizeDistributionHeaders[2]}>
                                                    1 in {numeral(100 / (prize.chances * 100)).format('0[.]00')}
                                                </td>
                                            </tr>
                                        ))}
                                    </Table>
                                </Card>
                            ) : (
                                prizes.map((prize, index) => (
                                    <Card flat key={`prize-${index}`} className={index < prizes.length ? 'mb-3' : ''}>
                                        <h4>{prizeDistributionHeaders[0]}</h4>
                                        <div className='stat-bg-white mb-3'>{numeral(prize.value / prize.count).format('$0,0[.]00')}</div>
                                        <h4>{prizeDistributionHeaders[1]}</h4>
                                        <div className='stat-bg-white mb-3'>{prize.count}</div>
                                        <h4>{prizeDistributionHeaders[2]}</h4>
                                        <div className='stat-bg-white'>1 in {numeral(100 / (prize.chances * 100)).format('0[.]00')}</div>
                                    </Card>
                                ))
                            )}
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
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='winning-chance-tooltip' />
                                </span>
                            </div>
                            <Card flat withoutPadding className='winning-chances-card d-flex flex-column justify-content-between h-auto'>
                                <div>
                                    <small>{I18n.t('poolDetails.winningChances.estimatedSavings')}</small>
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
                                                    {numeral(Number(estimationAmount) / (prices[denom] || 1)).format('0,0[.]00')} {denom.toUpperCase()}
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
                                    <small>{I18n.t('poolDetails.winningChances.chanceToWin')}</small>
                                    <div className='chance-to-win mt-2 stat-bg-white'>{NumbersUtils.float2ratio(estimatedChances)}</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className='row position-relative'>
                    <div className='col-12 col-xl-4'>
                        <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.users.title')}</h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row align-items-lg-center p-4'>
                            <div className='w-100 me-3'>
                                <small>{I18n.t('poolDetails.users.deposit')}</small>
                                <div className='stat-bg-white mb-0 mt-2'>${pool ? numeral(avgDeposit).format('0,0') : 0}</div>
                            </div>
                            <div className='w-100 mt-4 mt-lg-0'>
                                <small>{I18n.t('poolDetails.users.currentDraw')}</small>
                                <div className='stat-bg-white mb-0 mt-2'>{pool?.depositorsCount.toString() || 0}</div>
                            </div>
                        </Card>
                    </div>
                    <div className='col-12 col-xl-7'>
                        {!!prizesStats && (
                            <>
                                <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('poolDetails.winners.title')}
                                </h2>
                                <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between align-items-lg-center p-4'>
                                    <div className='w-100'>
                                        <small>{I18n.t('poolDetails.winners.totalPrizes')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>{numeral(prizesStats.totalPrizesUsdAmount).format('$0,0')}</div>
                                    </div>
                                    <div className='w-100 my-4 my-lg-0 mx-0 mx-lg-3'>
                                        <small>{I18n.t('poolDetails.winners.totalPoolPrizes')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>{numeral(prizesStats.totalPoolPrizes).format('0,0')}</div>
                                    </div>
                                    <div className='w-100'>
                                        <small>{I18n.t('poolDetails.winners.bestPrizeWon')}</small>
                                        <div className='stat-bg-white mb-0 mt-2'>
                                            $
                                            {numeral(NumbersUtils.convertUnitNumber(biggestPrizes && biggestPrizes.length ? biggestPrizes[0].amount.amount * biggestPrizes[0].usdTokenValue : 0))
                                                .format('0,0')
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
                                    price={prize.usdTokenValue}
                                    key={index}
                                    denom={prize.amount.denom}
                                    address={prize.winnerAddress}
                                    prize={prize.amount.amount}
                                />
                            ))}
                        </div>
                    </>
                )}
                {pool.draws && pool.draws.length > 0 && (
                    <div className='row'>
                        <div className='col-12'>
                            <h2 className='mb-2 mb-lg-4 mt-4 mt-lg-5'>{I18n.t('poolDetails.drawsHistory.title')}</h2>
                            <Card flat withoutPadding className='draws-history-card'>
                                {winSizes.width < Breakpoints.MD ? (
                                    <>
                                        <div
                                            className='d-flex flex-column'
                                            onClick={() => {
                                                if (pool.draws) {
                                                    setSelectedDraw(pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]);
                                                    modalRef.current?.show();
                                                }
                                            }}
                                        >
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[0]}</label>
                                                <div className='stat-bg-white'>
                                                    <div className='d-flex align-items-center justify-content-center index-container'>
                                                        #{pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.poolId.toString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-column my-3'>
                                                <label>{drawHistoryHeaders[1]}</label>
                                                <div className='stat-bg-white'>
                                                    <div className='d-flex align-items-center justify-content-center index-container'>
                                                        #{pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.drawId.toString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[2]}</label>
                                                <div className='stat-bg-white'>
                                                    <div className='draw-date'>
                                                        {dayjs(pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.createdAt).format('DD MMM YYYY - hh:mmA')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='d-flex flex-column my-3'>
                                                <label>{drawHistoryHeaders[3]}</label>
                                                <div className='stat-bg-white'>{pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.totalWinCount.toString()}</div>
                                            </div>
                                            <div className='d-flex flex-column'>
                                                <label>{drawHistoryHeaders[4]}</label>
                                                <div className='stat-bg-white'>
                                                    <SmallerDecimal
                                                        nb={numeral(
                                                            NumbersUtils.convertUnitNumber(pool.draws[(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem]?.totalWinAmount || '0') *
                                                                (prices[denom] || 1),
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
                                                disabled={(drawsHistoryPage - 1) * 5 + smallDrawsHistoryVisibleItem === pool.draws.length - 1}
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
                                                hasNextPage: drawsHistoryPage < Math.ceil(pool.draws.length / 5),
                                                pagesTotal: Math.ceil(pool.draws.length / 5),
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
                                        responsive={winSizes.width > Breakpoints.SM ? false : true}
                                        pagination={
                                            pool.draws.length > 5
                                                ? {
                                                      page: drawsHistoryPage,
                                                      pagesTotal: Math.ceil(pool.draws.length / 5),
                                                      hasNextPage: drawsHistoryPage < Math.ceil(pool.draws.length / 5),
                                                      hasPreviousPage: drawsHistoryPage > 1,
                                                  }
                                                : undefined
                                        }
                                        customPagination='draws-history-pagination'
                                        onPageChange={(page) => setDrawsHistoryPage(page)}
                                    >
                                        {pool.draws.slice((drawsHistoryPage - 1) * 5, (drawsHistoryPage - 1) * 5 + 5).map((draw, index) => {
                                            return (
                                                <tr
                                                    key={`draw-${index}`}
                                                    onClick={() => {
                                                        setSelectedDraw(draw);
                                                        modalRef.current?.show();
                                                    }}
                                                    className='scale-hover'
                                                >
                                                    <td data-label={drawHistoryHeaders[0]}>
                                                        <div className='d-flex align-items-center justify-content-center me-0 me-md-3 ms-auto ms-md-0 index-container'>#{draw.poolId.toString()}</div>
                                                    </td>
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
                                                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(draw.totalWinAmount) * (prices[denom] || 1)).format('$0,0[.]00')} />
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
            <DrawDetailsModal draw={selectedDraw} poolDenom={denom} prices={prices} modalRef={modalRef} />
        </div>
    );
};

export default PoolDetails;
