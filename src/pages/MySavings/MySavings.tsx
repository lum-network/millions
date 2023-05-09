import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import numeral from 'numeral';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { LumConstants, LumTypes } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';

import { Button, Card, SmallerDecimal, Lottie, Collapsible, Modal } from 'components';
import { NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { DepositModel } from 'models';
import { DenomsUtils, FontsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';

import DepositTable from './components/DepositTable/DepositTable';
import TransactionsTable from './components/TransationsTable/TransactionsTable';
import ClaimModal from './components/Modals/Claim/Claim';
import TransferOutModal from './components/Modals/TransferOut/TransferOut';
import LeavePoolModal from './components/Modals/LeavePool/LeavePool';

import './MySavings.scss';

const MySavings = () => {
    const { lumWallet, otherWallets, balances, activities, prizes, prices, pools, isTransferring, deposits, isReloadingInfos } = useSelector((state: RootState) => ({
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
    }));
    const dispatch = useDispatch<Dispatch>();

    const [assetToTransferOut, setAssetToTransferOut] = useState<string | null>(null);
    const [depositToLeave, setDepositToLeave] = useState<DepositModel | null>(null);

    const transferOutModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const winSizes = useWindowSize();

    const totalBalancePrice = balances ? numeral(WalletUtils.getTotalBalanceFromDeposits(deposits, prices)).format('$0,0[.]00') : '';
    const prizesToClaim = prizes ? prizes.slice(0, 3) : null;

    useEffect(() => {
        const page = activities?.currentPage;

        if (lumWallet && page && page > 1 && !activities.fullyLoaded) {
            dispatch.wallet.getActivities({ address: lumWallet.address, page });
        }
    }, [activities?.currentPage]);

    useEffect(() => {
        if (isReloadingInfos) {
            dispatch.wallet.setActivitiesPage(1);
        }
    }, [isReloadingInfos]);

    const renderAsset = (asset: LumTypes.Coin) => {
        const icon = DenomsUtils.getIconFromDenom(asset.denom);
        const normalDenom = DenomsUtils.getNormalDenom(asset.denom);
        const amount = NumbersUtils.convertUnitNumber(asset.amount);
        const bondedAmount = 0;
        const price = prices?.[normalDenom];

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
                                {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                                <div className='d-flex flex-column asset-amount'>
                                    <span>
                                        <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                    </span>
                                    <small className='p-0'>{price ? numeral(amount * price).format('$0,0[.]00') : '$ --'}</small>
                                </div>
                            </div>
                            <div className='action-buttons d-flex flex-column flex-sm-row align-items-stretch align-items-md-center justify-content-stretch justiy-content-md-between mt-3 mt-lg-0'>
                                {normalDenom !== LumConstants.LumDenom ? (
                                    <Button
                                        outline
                                        className='me-0 me-sm-4 mb-3 mb-sm-0 flex-grow-1'
                                        data-bs-target='#withdrawModal'
                                        data-bs-toggle='modal'
                                        onClick={async () => {
                                            setAssetToTransferOut(asset.denom);
                                        }}
                                    >
                                        {I18n.t('mySavings.withdraw')}
                                    </Button>
                                ) : null}
                                <Button to={`${NavigationConstants.POOLS}/${normalDenom}`} className='flex-grow-1'>
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

    const renderPrizeToClaim = (prize: Prize, index: number) => {
        if (!prize.amount) {
            return null;
        }

        const amount = Number(NumbersUtils.convertUnitNumber(prize.amount.amount));

        return (
            <div className={`d-flex flex-row align-items-center ${index > 0 ? 'mt-4' : ''}`} key={`prize-to-claim-${index}`}>
                <img src={DenomsUtils.getIconFromDenom(prize.amount.denom)} className='denom-icon' alt='Denom' />
                <div className='d-flex flex-column asset-amount'>
                    <span>
                        <SmallerDecimal nb={numeral(amount).format(amount < 1 ? '0,0[.]000000' : '0,0')} className='me-2' />
                        {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                    </span>
                    {prize.expiresAt ? <p className='expiration-date mb-0'>Expires {dayjs(prize.expiresAt).fromNow()}</p> : null}
                </div>
            </div>
        );
    };

    if (!lumWallet) {
        return <Navigate to={NavigationConstants.HOME} replace />;
    }

    return (
        <div className='my-savings-container mt-3 mt-lg-5'>
            {deposits && deposits.find((deposit) => deposit.errorState) ? (
                <Card flat withoutPadding className='d-flex flex-row align-items-center mb-5 p-4'>
                    <img src={Assets.images.info} width='45' />
                    <h3 className='mx-3 mb-0'>{I18n.t('mySavings.depositError.title')}</h3>
                    <p className='mb-0'>{I18n.t('mySavings.depositError.description')}</p>
                </Card>
            ) : null}
            {prizesToClaim && prizesToClaim.length > 0 ? (
                <Card flat withoutPadding className='d-flex flex-row align-items-center mb-5 p-4 new-prize-card'>
                    <img src={Assets.images.trophyGreen} width='45' />
                    <div className='d-flex flex-row align-items-baseline'>
                        <h3 className='ms-3 me-5 mb-0'>{I18n.t('mySavings.newPrize.title')}</h3>
                        <p className='mb-0'>{I18n.t('mySavings.newPrize.description')}</p>
                    </div>
                    <Button className='claim-btn ms-auto' data-bs-toggle='modal' data-bs-target='#claimModal'>
                        {I18n.t('mySavings.claim')}
                    </Button>
                </Card>
            ) : null}
            <div className='row'>
                <div className='col-12 col-lg-8 col-xxl-9'>
                    <div>
                        <h2>{I18n.t('mySavings.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div className='my-auto d-flex flex-column justify-content-center'>
                                {totalBalancePrice ? (
                                    <SmallerDecimal
                                        big
                                        nb={totalBalancePrice}
                                        fontSize={winSizes.width < 576 ? FontsUtils.calculateFontSize(totalBalancePrice.length, winSizes.width, 42) : undefined}
                                        className='balance-number mt-3'
                                    />
                                ) : (
                                    <div className='balance-number'>$ --</div>
                                )}
                            </div>
                            <div className='coins-container position-absolute top-0 start-0 w-100 h-100'>
                                <img src={Assets.images.coin} className='coin-1' alt='coin' />
                                <img src={Assets.images.coin} className='coin-2 d-block d-md-none' alt='coin' />
                                <img src={Assets.images.coin} className='coin-3' alt='coin' />
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
                        {prizesToClaim && prizesToClaim.length > 0 && winSizes.width <= 992 ? (
                            <div className='mt-5 mt-lg-0'>
                                <h2>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('mySavings.claimPrize')}
                                </h2>
                                <Card className='glow-bg'>
                                    <div className='d-flex flex-column prize-to-claim'>
                                        {prizesToClaim.map(renderPrizeToClaim)}
                                        <Button className='my-savings-cta mt-4' data-bs-toggle='modal' data-bs-target='#claimModal'>
                                            {I18n.t('mySavings.claim')}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ) : null}

                        {deposits && deposits.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.deposits')}</h2>
                                <Card withoutPadding className='py-0 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <DepositTable deposits={deposits} pools={pools} prices={prices} onLeavePool={(deposit) => setDepositToLeave(deposit)} />
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
                                    <Button to={NavigationConstants.POOLS}>{I18n.t('mySavings.deposit')}</Button>
                                </div>
                            )}
                        </Card>
                        {activities && activities.result.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.activities')}</h2>
                                <Card withoutPadding className='py-1 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5  glow-bg'>
                                    <TransactionsTable
                                        transactions={activities.result.slice((activities.currentPage - 1) * 30, (activities.currentPage - 1) * 30 + 30)}
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
                                        onPageChange={(page) => {
                                            dispatch.wallet.setActivitiesPage(page);
                                        }}
                                    />
                                </Card>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 col-xxl-3'>
                    <div className='row'>
                        {!prizesToClaim || (prizesToClaim && prizesToClaim.length === 0) || winSizes.width > 992 ? (
                            <div className='col-12 col-md-6 col-lg-12 mt-5 mt-lg-0'>
                                <h2>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('mySavings.claimPrize')}
                                </h2>
                                <Card className='glow-bg'>
                                    <div className='d-flex flex-column prize-to-claim'>
                                        {prizesToClaim && prizesToClaim.length > 0 ? (
                                            <>
                                                {prizesToClaim.map(renderPrizeToClaim)}
                                                <Button className='my-savings-cta mt-4' data-bs-toggle='modal' data-bs-target='#claimModal'>
                                                    {I18n.t('mySavings.claim')}
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
                                                <Button to={NavigationConstants.POOLS} className='mt-4'>
                                                    {I18n.t('mySavings.deposit')}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ) : null}
                        <div className='col-12 col-md-6 col-lg-12 mt-5'>
                            <h2>{I18n.t('mySavings.governance')}</h2>
                            <Card className='glow-bg'>
                                <h3>{I18n.t('mySavings.governanceCard.title')}</h3>
                                <p className='mt-4 mb-5'>{I18n.t('mySavings.governanceCard.description')}</p>
                                <Button className='my-savings-cta' onClick={() => window.open(NavigationConstants.DISCORD, '_blank')}>
                                    <img src={Assets.images.discord} alt='Discord' className='me-2' />
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
            {prizesToClaim && <ClaimModal prizes={prizesToClaim} prices={prices} pools={pools} />}
            <LeavePoolModal deposit={depositToLeave} />
        </div>
    );
};

export default MySavings;
