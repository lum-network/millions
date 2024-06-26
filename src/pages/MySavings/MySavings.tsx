import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import numeral from 'numeral';
import { Coin, LUM_DENOM, MICRO_LUM_DENOM } from '@lum-network/sdk-javascript';
import { DepositState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Assets from 'assets';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';

import { Button, Card, SmallerDecimal, Lottie, Collapsible, Modal, Leaderboard, PoolSelect, Tooltip } from 'components';
import { Breakpoints, FirebaseConstants, NavigationConstants, PrizesConstants } from 'constant';
import { useColorScheme, useWindowSize } from 'hooks';
import { DepositModel, LeaderboardItemModel } from 'models';
import { DenomsUtils, FontsUtils, I18n, NumbersUtils, WalletUtils, Firebase, PoolsUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { confettis } from 'utils/confetti';

import DepositTable from './components/DepositTable/DepositTable';
import TransactionsTable from './components/TransationsTable/TransactionsTable';
import ClaimModal from './components/Modals/Claim/Claim';
import TransferOutModal from './components/Modals/TransferOut/TransferOut';
import LeavePoolModal from './components/Modals/LeavePool/LeavePool';
import PrizesHistoryTable from './components/PrizesHistoryTable/PrizesHistoryTable';

import './MySavings.scss';

const MySavings = () => {
    const { lumWallet, otherWallets, balances, activities, prizes, prices, pools, isTransferring, deposits, isReloadingInfos, isLoadingNextLeaderboardPage, alreadySeenConfetti, totalPrizesWon } =
        useSelector((state: RootState) => ({
            lumWallet: state.wallet.lumWallet,
            otherWallets: state.wallet.otherWallets,
            balances: state.wallet.lumWallet?.balances,
            activities: state.wallet.lumWallet?.activities,
            deposits: state.wallet.lumWallet?.deposits,
            prizes: state.wallet.lumWallet?.prizes,
            prices: state.stats.prices,
            pools: state.pools.pools,
            isTransferring: state.loading.effects.wallet.ibcTransfer,
            isReloadingInfos: state.loading.effects.wallet.reloadWalletInfos,
            isLoadingNextLeaderboardPage: state.loading.effects.pools.getNextLeaderboardPage,
            alreadySeenConfetti: state.prizes.alreadySeenConfetti,
            totalPrizesWon: state.wallet.lumWallet?.totalPrizesWon,
        }));

    const location = useLocation();
    const dispatch = useDispatch<Dispatch>();

    const leaderboardPoolId = useMemo(() => {
        const state = location.state as { leaderboardPoolId?: string };

        if (!state) {
            return undefined;
        }

        return state.leaderboardPoolId;
    }, [location]);

    const [assetToTransferOut, setAssetToTransferOut] = useState<string | null>(null);
    const [depositToLeave, setDepositToLeave] = useState<DepositModel | null>(null);
    const [leaderboardSelectedPoolId, setLeaderboardSelectedPoolId] = useState<string | null>(pools && pools.length > 0 ? leaderboardPoolId || pools[0].poolId.toString() : null);
    const [leaderboardPage, setLeaderboardPage] = useState(0);
    const [userRankItems, setUserRankItems] = useState<LeaderboardItemModel[] | undefined>(undefined);
    const [prizesHistoryPage, setPrizesHistoryPage] = useState(1);

    const transferOutModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const leaderboardSectionRef = useRef<HTMLDivElement>(null);

    const winSizes = useWindowSize();
    const { isDark } = useColorScheme();

    const totalDeposited = WalletUtils.getTotalBalanceFromDeposits(deposits, prices);
    const totalDepositedCrypto = WalletUtils.getTotalBalanceFromDeposits(deposits);
    const totalBalancePrice = balances ? numeral(totalDeposited).format('$0,0[.]00') : '';
    const prizesToClaim = prizes && prizes.filter((prize) => prize.state === PrizesConstants.PrizeState.PENDING);

    const leaderboardPool = useMemo(() => {
        return leaderboardSelectedPoolId ? PoolsUtils.getPoolByPoolId(pools, leaderboardSelectedPoolId) : undefined;
    }, [leaderboardSelectedPoolId]);

    useEffect(() => {
        const getLeaderboardUserRank = async () => {
            if (leaderboardPool && lumWallet) {
                const userRankItems = await dispatch.wallet.getLeaderboardRank(leaderboardPool.poolId);

                setUserRankItems(userRankItems && userRankItems.length > 0 ? [...userRankItems] : undefined);
            }
        };

        if (!isReloadingInfos) {
            getLeaderboardUserRank().finally(() => null);
        }

        if (leaderboardPoolId && leaderboardSectionRef.current) {
            leaderboardSectionRef.current.scrollIntoView();
        }
    }, [isReloadingInfos, leaderboardPool, lumWallet]);

    useEffect(() => {
        if (pools && pools.length > 0) {
            const poolId = leaderboardPoolId || pools[0].poolId.toString();

            setLeaderboardSelectedPoolId(poolId);
            ScrollTrigger.refresh();
        }
    }, [pools]);

    useEffect(() => {
        if (leaderboardPool && leaderboardPage > 0) {
            dispatch.pools.getNextLeaderboardPage({ poolId: leaderboardPool.poolId, page: leaderboardPage, limit: 50 });
        }
    }, [leaderboardPage]);

    useEffect(() => {
        if (isReloadingInfos) {
            dispatch.wallet.setActivitiesPage(1);
        }
    }, [isReloadingInfos]);

    useEffect(() => {
        if (prizesToClaim && prizesToClaim.length && !alreadySeenConfetti) {
            dispatch.prizes.seenConfetti();
            confettis(5000);
        }
    }, [prizesToClaim]);

    useLayoutEffect(() => {
        const refreshST = () => {
            ScrollTrigger.refresh();
        };

        const myCollapsibles = document.getElementsByClassName('collapsible');

        for (const el of myCollapsibles) {
            el.addEventListener('shown.bs.collapse', refreshST);
            el.addEventListener('hidden.bs.collapse', refreshST);
        }

        return () => {
            const myCollapsibles = document.getElementsByClassName('collapsible');

            for (const el of myCollapsibles) {
                el.removeEventListener('shown.bs.collapse', refreshST);
                el.removeEventListener('hidden.bs.collapse', refreshST);
            }
        };
    }, []);

    const renderAsset = (asset: Coin) => {
        const icon = DenomsUtils.getIconFromDenom(asset.denom);
        const normalDenom = DenomsUtils.getNormalDenom(asset.denom);
        const amount = NumbersUtils.convertUnitNumber(asset.amount, asset.denom);
        const bondedAmount = 0;
        const price = prices?.[normalDenom];
        const usdAmount = price ? amount * price : 0;

        return (
            <Collapsible
                id={`asset-${asset.denom}`}
                className='asset-card'
                key={asset.denom}
                toggleWithButton
                disabled
                header={
                    <>
                        <div className='d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-center flex-grow-1'>
                            <div className='d-flex flex-row align-items-center'>
                                {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon no-filter' /> : <div className='denom-unknown-icon no-filter'>?</div>}
                                <div className='d-flex flex-column asset-amount'>
                                    <span title={amount.toString()}>
                                        <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                    </span>
                                    <small className='p-0'>{price ? numeral(usdAmount < 0.001 ? 0 : usdAmount).format('$0,0[.]00') : '$ --'}</small>
                                </div>
                            </div>
                            <div className='action-buttons d-flex flex-column flex-sm-row align-items-stretch align-items-md-center justify-content-stretch justiy-content-md-between mt-3 mt-lg-0'>
                                {normalDenom !== LUM_DENOM ? (
                                    <Button
                                        outline
                                        className='me-0 me-sm-4 mb-3 mb-sm-0 flex-grow-1'
                                        data-bs-target='#withdrawModal'
                                        data-bs-toggle='modal'
                                        onClick={async () => {
                                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TRANSFER_OUT_CLICK);
                                            setAssetToTransferOut(asset.denom);
                                        }}
                                        forcePurple
                                    >
                                        {I18n.t('mySavings.withdraw')}
                                    </Button>
                                ) : null}
                                <Button
                                    disabled={normalDenom === LUM_DENOM && !pools.find((pool) => pool.nativeDenom === MICRO_LUM_DENOM)}
                                    to={`${NavigationConstants.POOLS}/${normalDenom}`}
                                    className='flex-grow-1'
                                    onClick={() => {
                                        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSIT_CLICK, { denom: normalDenom });
                                    }}
                                    forcePurple
                                >
                                    {I18n.t('mySavings.deposit')}
                                </Button>
                            </div>
                        </div>
                    </>
                }
                content={
                    <div className='pt-5 d-flex flex-row'>
                        <Card flat withoutPadding className='p-3 asset-details-card d-flex justify-content-start align-items-center bg-white'>
                            <div className='asset-details-icon-container me-3 d-flex align-items-center justify-content-center'>
                                <img src={Assets.images.checkmark} alt='checkmark' />
                            </div>
                            <div className='asset-detail d-flex flex-column align-items-start'>
                                Available
                                <span className='asset-detail-amount'>
                                    <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                </span>
                            </div>
                        </Card>
                        <Card flat withoutPadding className='ms-4 p-3 asset-details-card d-flex justify-content-start align-items-center bg-white'>
                            <div className='asset-details-icon-container me-3 d-flex align-items-center justify-content-center'>
                                <img src={Assets.images.bonded} alt='bonded' />
                            </div>
                            <div className='asset-detail d-flex flex-column align-items-start'>
                                Bonded
                                <span className='asset-detail-amount'>
                                    <SmallerDecimal nb={numeral(bondedAmount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                </span>
                            </div>
                        </Card>
                    </div>
                }
            />
        );
    };

    const renderTotalPrizesWon = (): JSX.Element => {
        return (
            <div className='d-flex flex-column prize-to-claim'>
                {totalPrizesWon && Object.keys(totalPrizesWon).length > 0 ? (
                    <>
                        {Object.entries(totalPrizesWon).map(([denom, amount]) => {
                            const icon = DenomsUtils.getIconFromDenom(denom);
                            const normalDenom = DenomsUtils.getNormalDenom(denom);
                            const price = prices?.[normalDenom];

                            return (
                                <div className='d-flex flex-row align-items-center justify-content-between mb-3' key={denom}>
                                    <div className='d-flex flex-row align-items-center'>
                                        {icon ? <img src={icon} alt={`${denom} icon`} className='denom-icon no-filter' /> : <div className='denom-unknown-icon'>?</div>}
                                        <div className='d-flex flex-column asset-amount'>
                                            <span>
                                                <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                            </span>
                                            <p className='p-0 m-0 subtitle'>{price ? numeral(amount * price).format('$0,0[.]00') : '$ --'}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <Button className='my-savings-cta mt-4 text-center' to={NavigationConstants.POOLS} forcePurple>
                            {I18n.t('mySavings.getMorePrizes')}
                        </Button>
                    </>
                ) : (
                    <div className='d-flex flex-column align-items-center justify-content-center text-center'>
                        <Lottie
                            className='cosmonaut-with-balloons'
                            animationData={cosmonautWithBalloons}
                            segments={[
                                [0, 30],
                                [30, 128],
                            ]}
                        />
                        <h3 className='mt-2'>{I18n.t('mySavings.noPrizes.title')}</h3>
                        <p className='text-center'>{I18n.t('mySavings.noPrizes.subtitle')}</p>
                        <Button to={NavigationConstants.POOLS} className='mt-4' forcePurple>
                            {I18n.t('mySavings.deposit')}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    if (!lumWallet) {
        return <Navigate to={NavigationConstants.HOME} replace />;
    }

    return (
        <div id='my-savings' className='my-savings-container mt-3 mt-lg-5'>
            {deposits && deposits.find((deposit) => deposit.state === DepositState.DEPOSIT_STATE_FAILURE) ? (
                <Card flat withoutPadding className='deposit-error-card d-flex flex-row align-items-center mb-5 p-4'>
                    <img alt='info' src={Assets.images.info} width='45' />
                    <h3 className='mx-3 mb-0'>{I18n.t('mySavings.depositError.title')}</h3>
                    <p className='mb-0'>{I18n.t('mySavings.depositError.description')}</p>
                </Card>
            ) : null}
            {prizesToClaim && prizesToClaim.length > 0 ? (
                <Card flat withoutPadding className='d-flex flex-column flex-md-row align-items-md-center mb-5 p-4 new-prize-card'>
                    <div className='d-flex flex-column flex-md-row align-items-md-center'>
                        <div className='d-flex flex-row align-items-center'>
                            <img alt='green trophy' src={Assets.images.trophyGreen} width='45' className='no-filter' />
                            <h3 className='ms-3 me-5 mb-0 text-nowrap'>{I18n.t('mySavings.newPrize.title')}</h3>
                        </div>
                        <p className='my-3 my-md-0'>{I18n.t('mySavings.newPrize.description')}</p>
                    </div>
                    <Button
                        className='claim-btn ms-md-auto'
                        data-bs-toggle='modal'
                        data-bs-target='#claimModal'
                        onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.CLAIM_PRIZE_CLICK)}
                    >
                        {I18n.t('mySavings.claim')}
                    </Button>
                </Card>
            ) : null}
            <div className='row'>
                <div className='col-12 col-lg-8'>
                    <div>
                        <h2>{I18n.t('mySavings.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div className='background-container'>
                                <img src={Assets.images.orbit} className='orbit' />
                            </div>
                            <div className='my-auto d-flex flex-column justify-content-center'>
                                {totalBalancePrice ? (
                                    <SmallerDecimal
                                        big
                                        nb={totalBalancePrice}
                                        fontSize={winSizes.width < Breakpoints.SM ? FontsUtils.calculateFontSize(totalBalancePrice.length, winSizes.width, 42) : undefined}
                                        className='balance-number mt-3'
                                    />
                                ) : (
                                    <div className='balance-number'>$ --</div>
                                )}
                            </div>
                            <div className='coins-container position-absolute top-0 start-0 w-100 h-100'>
                                <img src={Assets.images.coin} className='coin-1 no-filter' alt='coin' />
                                <img src={Assets.images.coin} className='coin-2 d-block d-md-none no-filter' alt='coin' />
                                <img src={Assets.images.coin} className='coin-3 no-filter' alt='coin' />
                            </div>
                            <Lottie
                                className='d-none d-md-block cosmonaut'
                                animationData={cosmonautWithCoin}
                                segments={[
                                    [0, 30],
                                    [30, 100],
                                ]}
                            />
                        </Card>
                        {winSizes.width < Breakpoints.LG ? (
                            <div className='mt-5 mt-lg-0'>
                                <h2>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('mySavings.mySavingStreak')}
                                </h2>
                                <Card className='glow-bg'>{renderTotalPrizesWon()}</Card>
                            </div>
                        ) : null}

                        {deposits && deposits.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.deposits')}</h2>
                                <Card withoutPadding className='py-0 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <DepositTable
                                        deposits={deposits}
                                        pools={pools}
                                        prices={prices}
                                        onLeavePool={(deposit) => setDepositToLeave(deposit)}
                                        onDepositRetry={(deposit) => dispatch.wallet.retryDeposit({ poolId: deposit.poolId, depositId: deposit.depositId })}
                                        onWithdrawalRetry={(deposit) => {
                                            if (deposit.withdrawalId) {
                                                dispatch.wallet.leavePoolRetry({
                                                    poolId: deposit.poolId,
                                                    withdrawalId: deposit.withdrawalId,
                                                    denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
                                                });
                                            }
                                        }}
                                    />
                                </Card>
                            </>
                        ) : null}
                        <h2 className='mt-5'>{I18n.t('mySavings.assets')}</h2>
                        <Card withoutPadding className='glow-bg py-3 py-sm-4 py-xl-5 px-3 px-sm-4 px-xl-5'>
                            {balances && balances.length > 0 ? (
                                balances.map(renderAsset)
                            ) : (
                                <div className='d-flex flex-column align-items-center justify-content-center'>
                                    <img src={Assets.images.coinsStacked} alt='Stacked coins' />
                                    <h3 className='mt-2'>{I18n.t('mySavings.noAssets.title')}</h3>
                                    <p className='text-center'>{I18n.t('mySavings.noAssets.description')}</p>
                                    <Button to={NavigationConstants.POOLS} forcePurple>
                                        {I18n.t('mySavings.deposit')}
                                    </Button>
                                </div>
                            )}
                        </Card>
                        {prizes && prizes.length ? (
                            <>
                                <div className='mt-5 p-2 d-flex align-items-center justify-content-between'>
                                    <h2>
                                        <img src={Assets.images.trophyPurple} alt='Trophy' className='me-3 mb-1' width='28' />
                                        {I18n.t('mySavings.prizesHistory')}
                                    </h2>
                                    {prizesToClaim && prizesToClaim.length ? (
                                        <Button data-bs-toggle='modal' data-bs-target='#claimModal' onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.CLAIM_PRIZE_CLICK)}>
                                            {I18n.t('mySavings.claimAll')}
                                        </Button>
                                    ) : null}
                                </div>
                                <Card withoutPadding className='py-1 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <PrizesHistoryTable
                                        prizes={
                                            winSizes.width < Breakpoints.MD || (winSizes.width > Breakpoints.LG && winSizes.width < Breakpoints.XL)
                                                ? prizes
                                                : prizes.slice((prizesHistoryPage - 1) * 5, (prizesHistoryPage - 1) * 5 + 5)
                                        }
                                        pagination={
                                            prizes.length > 5
                                                ? {
                                                      page: prizesHistoryPage,
                                                      pagesTotal: Math.ceil(prizes.length / 5),
                                                      hasNextPage: prizesHistoryPage < Math.ceil(prizes.length / 5),
                                                      hasPreviousPage: prizesHistoryPage > 1,
                                                  }
                                                : undefined
                                        }
                                        onPageChange={setPrizesHistoryPage}
                                    />
                                </Card>
                            </>
                        ) : null}
                        {activities && activities.result.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.activities')}</h2>
                                <Card withoutPadding className='py-1 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5  glow-bg'>
                                    <TransactionsTable
                                        transactions={activities.result}
                                        pagination={
                                            activities.pagesTotal > 1
                                                ? {
                                                      page: activities.currentPage,
                                                      pagesTotal: activities.pagesTotal,
                                                      hasNextPage: activities.currentPage < activities.pagesTotal,
                                                      hasPreviousPage: activities.currentPage > 1,
                                                  }
                                                : undefined
                                        }
                                        onPageChange={dispatch.wallet.setActivitiesPage}
                                    />
                                </Card>
                            </>
                        ) : null}
                        {leaderboardPool ? (
                            <div ref={leaderboardSectionRef} className='leaderboard-section'>
                                <div className='mt-5 mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between'>
                                    <div className='d-flex align-items-center mb-3 mb-sm-0'>
                                        <h2 className='mb-0'>{I18n.t('mySavings.depositorsRanking')}</h2>
                                        <span data-tooltip-id='depositor-ranking-hint' data-tooltip-html={I18n.t('leaderboard.hint')} className='ms-2 mb-2'>
                                            <img src={Assets.images.info} alt='info' />
                                            <Tooltip id='depositor-ranking-hint' />
                                        </span>
                                    </div>
                                    <PoolSelect
                                        className='pool-select'
                                        backgroundColor={isDark ? '#20142d' : '#F4F4F4'}
                                        value={leaderboardPool.poolId.toString()}
                                        pools={pools}
                                        options={pools.map((pool) => ({
                                            value: pool.poolId.toString(),
                                            label: `${DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()} - ${I18n.t('pools.poolId', { poolId: pool.poolId.toString() })}`,
                                        }))}
                                        onChange={(value) => {
                                            setLeaderboardSelectedPoolId(value);
                                        }}
                                    />
                                </div>
                                <Leaderboard
                                    pool={leaderboardPool}
                                    enableAnimation={!!userRankItems}
                                    userRank={
                                        userRankItems
                                            ? {
                                                  ...userRankItems[1],
                                                  prev: userRankItems[0],
                                                  next: userRankItems[2],
                                              }
                                            : undefined
                                    }
                                    price={prices[DenomsUtils.getNormalDenom(leaderboardPool.nativeDenom)]}
                                    hasMore={!leaderboardPool.leaderboard.fullyLoaded}
                                    onBottomReached={() => {
                                        if (isLoadingNextLeaderboardPage) {
                                            return;
                                        }
                                        setLeaderboardPage(leaderboardPage + 1);
                                    }}
                                    lumWallet={lumWallet}
                                    totalDeposited={totalDepositedCrypto}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 side-bar'>
                    <div className='row'>
                        {winSizes.width > Breakpoints.LG ? (
                            <div className='col-12 col-md-6 col-lg-12 mt-5 mt-lg-0'>
                                <h2>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('mySavings.mySavingStreak')}
                                </h2>
                                <Card className='glow-bg'>{renderTotalPrizesWon()}</Card>
                            </div>
                        ) : null}
                        <div className='col-12 col-md-6 col-lg-12 mt-5'>
                            <h2>{I18n.t('mySavings.governance')}</h2>
                            <Card className='glow-bg'>
                                <h3>{I18n.t('mySavings.governanceCard.title')}</h3>
                                <p className='mt-4 mb-5'>{I18n.t('mySavings.governanceCard.description')}</p>
                                <Button
                                    className='my-savings-cta'
                                    onClick={() => {
                                        window.open(NavigationConstants.BUY_LUM, '_blank');
                                        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.BUY_LUM_CLICK);
                                    }}
                                    forcePurple
                                >
                                    {I18n.t('mySavings.governanceCard.cta')}
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <TransferOutModal
                modalRef={transferOutModalRef}
                asset={assetToTransferOut}
                lumWallet={lumWallet}
                otherWallets={otherWallets}
                pools={pools}
                prices={prices}
                balances={balances || []}
                isLoading={isTransferring}
            />
            <ClaimModal prizes={prizesToClaim || []} prices={prices} pools={pools} limit={lumWallet.isLedger ? 3 : 6} />
            <LeavePoolModal deposit={depositToLeave} />
        </div>
    );
};

export default MySavings;
