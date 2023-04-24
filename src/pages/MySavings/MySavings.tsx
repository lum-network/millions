import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { LumConstants, LumTypes } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';

import { Button, Card, SmallerDecimal, Lottie, Collapsible, Modal } from 'components';
import { NavigationConstants } from 'constant';
import { DepositModel } from 'models';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import Error404 from 'pages/404/404';
import { RootState } from 'redux/store';

import DepositTable from './components/DepositTable/DepositTable';
import TransactionsTable from './components/TransationsTable/TransactionsTable';
import ClaimModal from './components/Modals/Claim/Claim';
import TransferOutModal from './components/Modals/TransferOut/TransferOut';
import LeavePoolModal from './components/Modals/LeavePool/LeavePool';

import './MySavings.scss';

const MySavings = () => {
    const [assetToTransferOut, setAssetToTransferOut] = useState<string | null>(null);
    const [depositToLeave, setDepositToLeave] = useState<DepositModel | null>(null);

    const { lumWallet, otherWallets, balances, activities, prizes, prices, pools, isTransferring, deposits } = useSelector((state: RootState) => ({
        lumWallet: state.wallet.lumWallet,
        otherWallets: state.wallet.otherWallets,
        balances: state.wallet.lumWallet?.balances,
        activities: state.wallet.lumWallet?.activities,
        deposits: state.wallet.lumWallet?.deposits,
        prizes: state.wallet.lumWallet?.prizes,
        prices: state.stats.prices,
        pools: state.pools.pools,
        isTransferring: state.loading.effects.wallet.ibcTransfer,
    }));

    const transferOutModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const totalBalancePrice = balances ? WalletUtils.getTotalBalanceFromDeposits(deposits, prices) : null;
    const prizesToClaim = prizes ? prizes.slice(0, 3) : null;

    const renderAsset = (asset: LumTypes.Coin) => {
        const icon = DenomsUtils.getIconFromDenom(asset.denom);
        const normalDenom = DenomsUtils.getNormalDenom(asset.denom);
        const amount = NumbersUtils.convertUnitNumber(asset.amount);
        const bondedAmount = 0;
        const price = prices?.[normalDenom];

        return (
            <Collapsible
                id={`asset-${asset.denom}`}
                className='asset-card p-3 py-4 p-sm-4 p-xl-5'
                key={asset.denom}
                toggleWithButton
                disabled
                header={
                    <>
                        <div className='d-flex justify-content-between align-items-center flex-grow-1'>
                            <div className='d-flex flex-row align-items-center'>
                                {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                                <div className='d-flex flex-column asset-amount'>
                                    <span>
                                        <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                    </span>
                                    <small className='p-0'>{price ? numeral(amount * price).format('$0,0[.]00') : '$ --'}</small>
                                </div>
                            </div>
                            <div className='action-buttons d-flex flex-row align-items-center'>
                                {normalDenom !== LumConstants.LumDenom ? (
                                    <Button
                                        outline
                                        className='me-3'
                                        data-bs-target='#withdrawModal'
                                        data-bs-toggle='modal'
                                        onClick={async () => {
                                            setAssetToTransferOut(asset.denom);
                                        }}
                                    >
                                        {I18n.t('mySavings.withdraw')}
                                    </Button>
                                ) : null}
                                <Button to={`${NavigationConstants.POOLS}/${normalDenom}`}>{I18n.t('mySavings.deposit')}</Button>
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

    if (!lumWallet) {
        return <Error404 />;
    }

    return (
        <div className='mt-5'>
            {deposits && deposits.find((deposit) => deposit.errorState) ? (
                <Card flat withoutPadding className='d-flex flex-row align-items-center mb-5 p-4'>
                    <img src={Assets.images.info} width='45' />
                    <h3 className='mx-3 mb-0'>{I18n.t('mySavings.depositError.title')}</h3>
                    <p className='mb-0'>{I18n.t('mySavings.depositError.description')}</p>
                </Card>
            ) : null}
            <div className='row'>
                <div className='col-12 col-lg-8 col-xxl-9'>
                    <div>
                        <h2>{I18n.t('mySavings.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div className='my-auto d-flex flex-column justify-content-center'>
                                {totalBalancePrice ? (
                                    <SmallerDecimal big nb={numeral(totalBalancePrice).format('$0,0[.]00')} className='balance-number mt-3' />
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
                        {deposits && deposits.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.deposits')}</h2>
                                <Card withoutPadding className='py-2 py-xl-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <DepositTable deposits={deposits} onLeavePool={(deposit) => setDepositToLeave(deposit)} />
                                </Card>
                            </>
                        ) : null}
                        <h2 className='mt-5'>{I18n.t('mySavings.assets')}</h2>
                        <Card className='glow-bg'>
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
                        {activities && activities.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('mySavings.activities')}</h2>
                                <Card withoutPadding className='py-2 py-xl-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <TransactionsTable transactions={activities} />
                                </Card>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 col-xxl-3'>
                    <div className='row'>
                        {prizesToClaim && prizesToClaim.length > 0 ? (
                            <div className='col-12 col-md-6 col-lg-12 mt-5 mt-lg-0'>
                                <h2>
                                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                                    {I18n.t('mySavings.claimPrize')}
                                </h2>
                                <Card className='glow-bg'>
                                    <div className='d-flex flex-column prize-to-claim'>
                                        {prizesToClaim.map((prize, index) => {
                                            if (!prize.amount) {
                                                return null;
                                            }

                                            const amount = Number(NumbersUtils.convertUnitNumber(prize.amount.amount));

                                            return (
                                                <span className={`asset-amount ${index > 0 ? 'mt-4' : ''}`} key={`prize-to-claim-${index}`}>
                                                    <img src={DenomsUtils.getIconFromDenom(prize.amount.denom)} className='denom-icon' alt='Denom' />
                                                    <SmallerDecimal nb={numeral(amount).format(amount < 1 ? '0,0[.]000000' : '0,0')} className='me-2' />
                                                    {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                                                </span>
                                            );
                                        })}
                                        <Button className='my-savings-cta mt-4' data-bs-toggle='modal' data-bs-target='#claimModal'>
                                            {I18n.t('mySavings.claim')}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ) : null}
                        <div className={`col-12 col-md-6 col-lg-12 ${prizesToClaim && prizesToClaim.length > 0 ? 'mt-5 mt-md-5 mt-lg-5' : 'mt-5 mt-lg-0'}`}>
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
