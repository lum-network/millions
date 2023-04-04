import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import numeral from 'numeral';
import { LumConstants, LumTypes } from '@lum-network/sdk-javascript';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Assets from 'assets';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';

import { Button, Card, Modal, SmallerDecimal, Lottie, Collapsible } from 'components';
import { DenomsUtils, I18n, LumClient, NumbersUtils, WalletUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

import Claim from './components/Claim/Claim';
import DepositTable from './components/DepositTable/DepositTable';
import TransferOut from './components/TransferOut/TransferOut';
import TransactionsTable from './components/TransationsTable/TransactionsTable';

import './MyPlace.scss';

const MyPlace = () => {
    const { lumWallet, otherWallets, balances, activities, prizesToClaim, prices, pools, isTransferring, deposits } = useSelector((state: RootState) => ({
        lumWallet: state.wallet.lumWallet,
        otherWallets: state.wallet.otherWallets,
        balances: state.wallet.lumWallet?.balances,
        activities: state.wallet.lumWallet?.activities,
        deposits: state.wallet.lumWallet?.deposits,
        prizesToClaim: state.wallet.prizesToClaim,
        prices: state.stats.prices,
        pools: state.pools.pools,
        isTransferring: state.loading.effects.wallet.ibcTransfer,
    }));

    const dispatch = useDispatch<Dispatch>();

    const withdrawForm = useFormik({
        initialValues: {
            withdrawAddress: '',
            denom: '',
            amount: '',
        },
        validationSchema: yup.object().shape({
            withdrawAddress: yup.string().required(I18n.t('errors.generic.required', { field: 'Withdraw address' })),
            denom: yup.string().required(I18n.t('errors.generic.required', { field: 'Asset' })),
            amount: yup.string().required(I18n.t('errors.generic.required', { field: 'Amount' })),
        }),
        onSubmit: async (values) => {
            const normalDenom = DenomsUtils.getNormalDenom(values.denom);
            const destWallet = otherWallets[normalDenom];
            const amount = values.amount.toString();
            const pool = pools.find((pool) => pool.nativeDenom === values.denom);

            if (lumWallet && destWallet && pool && pool.internalInfos) {
                await dispatch.wallet.ibcTransfer({
                    toAddress: destWallet.address,
                    fromAddress: lumWallet.address,
                    type: 'withdraw',
                    amount: {
                        amount,
                        denom: pool.internalInfos.ibcDenom,
                    },
                    normalDenom: normalDenom,
                    ibcChannel: pool.internalInfos.ibcSourceChannel,
                    chainId: LumClient.getChainId() || '',
                });
            }
        },
    });

    const onDenomChange = async (denom: string) => {
        const normalDenom = DenomsUtils.getNormalDenom(denom);

        await withdrawForm.setValues({
            withdrawAddress: otherWallets[normalDenom]?.address || '',
            denom,
            amount: '0',
        });
    };

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
                        <div className='d-flex justify-content-between align-items-center flex-grow-1 me-4'>
                            <div className='d-flex flex-row align-items-center'>
                                {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                                <div className='d-flex flex-column asset-amount'>
                                    <span>
                                        <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                                    </span>
                                    <small className='p-0'>{price ? numeral(amount * price).format('$0,0.[00]') : '$ --'}</small>
                                </div>
                            </div>
                            <div className='action-buttons d-flex flex-row align-items-center'>
                                {normalDenom !== LumConstants.LumDenom ? (
                                    <Button
                                        outline
                                        className='me-3'
                                        data-bs-toggle='modal'
                                        data-bs-target='#withdrawModal'
                                        onClick={async () => {
                                            onDenomChange(asset.denom);
                                        }}
                                    >
                                        {I18n.t('myPlace.withdraw')}
                                    </Button>
                                ) : null}
                                <Button to={`${NavigationConstants.POOLS}/${normalDenom}`}>{I18n.t('myPlace.deposit')}</Button>
                            </div>
                        </div>
                    </>
                }
                content={
                    <div className='pt-5 d-flex flex-row'>
                        <Card flat withoutPadding className='p-3 asset-details-card d-flex justify-content-start align-items-center bg-white'>
                            <div className='asset-details-icon-container me-3 d-flex align-items-center justify-content-center'>
                                <img src={Assets.images.checkmark} />
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
                                <img src={Assets.images.bonded} />
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

    const totalBalancePrice = balances ? WalletUtils.getTotalBalance(balances, prices) : null;

    return (
        <>
            <div className='row'>
                <div className='col-12 col-lg-8 col-xxl-9'>
                    <div>
                        <h2>{I18n.t('myPlace.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div className='my-auto d-flex flex-column justify-content-center'>
                                {totalBalancePrice ? (
                                    <SmallerDecimal big nb={numeral(totalBalancePrice).format('$0,0.[00]')} className='balance-number mt-3' />
                                ) : (
                                    <div className='balance-number'>$ --</div>
                                )}
                            </div>
                            <div className='coins-container position-absolute top-0 start-0 w-100 h-100'>
                                <img src={Assets.images.coin} className='coin-1' alt='coin' />
                                <img src={Assets.images.coin} className='coin-2' alt='coin' />
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
                                <h2 className='mt-5'>{I18n.t('myPlace.deposits')}</h2>
                                <Card withoutPadding className='py-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <DepositTable deposits={deposits} />
                                </Card>
                            </>
                        ) : null}
                        <h2 className='mt-5'>{I18n.t('myPlace.assets')}</h2>
                        <Card className='glow-bg'>
                            {balances && balances.length > 0 ? (
                                balances.map(renderAsset)
                            ) : (
                                <div className='d-flex flex-column align-items-center justify-content-center'>
                                    <img src={Assets.images.coinsStacked} alt='Stacked coins' />
                                    <h3 className='mt-2'>{I18n.t('myPlace.noAssets.title')}</h3>
                                    <p className='text-center'>{I18n.t('myPlace.noAssets.description')}</p>
                                    <Button>{I18n.t('myPlace.deposit')}</Button>
                                </div>
                            )}
                        </Card>
                        {activities && activities.length > 0 ? (
                            <>
                                <h2 className='mt-5'>{I18n.t('myPlace.activities')}</h2>
                                <Card withoutPadding className='py-4 px-3 px-sm-4 px-xl-5 glow-bg'>
                                    <TransactionsTable transactions={activities} />
                                </Card>
                            </>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 col-xxl-3'>
                    {prizesToClaim.length > 0 ? (
                        <div className='mt-4 mt-lg-0'>
                            <h2>
                                <img src={Assets.images.trophy} alt='Trophy' className='me-3' width='24' />
                                {I18n.t('myPlace.claimPrize')}
                            </h2>
                            <Card className='glow-bg'>
                                <div className='d-flex flex-column prize-to-claim'>
                                    {prizesToClaim.map((prize, index) =>
                                        prize.amount ? (
                                            <span className={`asset-amount ${index > 0 ? 'mt-3' : ''}`} key={`prize-to-claim-${index}`}>
                                                <img src={DenomsUtils.getIconFromDenom(prize.amount.denom)} className='denom-icon' alt='Denom' />
                                                <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prize.amount.amount)).format('0,0')} className='me-2' />
                                                {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                                            </span>
                                        ) : null,
                                    )}
                                    <Button className='my-place-cta mt-4' data-bs-toggle='modal' data-bs-target='#claimModal'>
                                        {I18n.t('myPlace.claim')}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ) : null}
                    <h2 className={prizesToClaim.length > 0 ? 'mt-5' : 'mt-5 mt-lg-0'}>{I18n.t('myPlace.governance')}</h2>
                    <Card className='glow-bg'>
                        <h3>{I18n.t('myPlace.governanceCard.title')}</h3>
                        <p className='mt-4 mb-5'>{I18n.t('myPlace.governanceCard.description')}</p>
                        <Button className='my-place-cta' onClick={() => window.open(NavigationConstants.DISCORD, '_blank')}>
                            <img src={Assets.images.discord} alt='Discord' className='me-2' />
                            {I18n.t('myPlace.governanceCard.cta')}
                        </Button>
                    </Card>
                </div>
            </div>
            <Modal id='withdrawModal' modalWidth={1080} withCloseButton={false}>
                <TransferOut form={withdrawForm} prices={prices} balances={balances || []} isLoading={isTransferring} />
            </Modal>
            <Modal id='claimModal' modalWidth={1080} withCloseButton={false}>
                <Claim prizes={prizesToClaim} prices={prices} onClaim={() => true} onClaimAndCompound={() => true} isLoading={false} />
            </Modal>
        </>
    );
};

export default MyPlace;
