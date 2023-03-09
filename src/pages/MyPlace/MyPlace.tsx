import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import numeral from 'numeral';
import { LumConstants, LumTypes } from '@lum-network/sdk-javascript';
import { useFormik } from 'formik';
import * as yup from 'yup';

import coin from 'assets/images/coin.svg';
import coinsStacked from 'assets/images/coins_stacked.svg';
import discordIcon from 'assets/images/discord.svg';
import downArrow from 'assets/images/down_arrow.svg';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';

import { Button, Card, Modal, SmallerDecimal, AmountInput, AssetsSelect, Lottie } from 'components';
import { DenomsUtils, I18n, LumClient, NumbersUtils, WalletUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { NavigationConstants, PoolsConstants } from 'constant';

import './MyPlace.scss';

const MyPlace = () => {
    const { lumWallet, otherWallets, balances, activities, prizeToClaim, prices } = useSelector((state: RootState) => ({
        lumWallet: state.wallet.lumWallet,
        otherWallets: state.wallet.otherWallets,
        balances: state.wallet.lumWallet?.balances,
        activities: state.wallet.lumWallet?.activities,
        prizeToClaim: state.wallet.prizeToClaim,
        prices: state.stats.prices,
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

            if (lumWallet && destWallet) {
                await dispatch.wallet.ibcTransfer({
                    toAddress: destWallet.address,
                    fromAddress: lumWallet.address,
                    type: 'withdraw',
                    amount: {
                        amount,
                        denom: PoolsConstants.POOLS[normalDenom].ibcDenom,
                    },
                    normalDenom: normalDenom,
                    ibcChannel: PoolsConstants.POOLS[normalDenom].ibcSourceChannel,
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
        const price = prices?.[normalDenom];

        return (
            <Card flat key={asset.denom} className='asset-card'>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex flex-row align-items-center'>
                        {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                        <div className='d-flex flex-column asset-amount'>
                            <span>
                                <SmallerDecimal nb={numeral(amount).format(amount >= 1000 ? '0,0' : '0,0.000')} /> {normalDenom.toUpperCase()}
                            </span>
                            <small className='p-0'>{price ? numeral(amount * price).format('$0,0.[00]') : '$ --'}</small>
                        </div>
                    </div>
                    {normalDenom !== LumConstants.LumDenom ? (
                        <div className='d-flex flex-row align-items-center'>
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
                            <Button to={`${NavigationConstants.POOLS}/${normalDenom}`}>{I18n.t('myPlace.deposit')}</Button>
                        </div>
                    ) : null}
                </div>
            </Card>
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
                                <img src={coin} className='coin-1' alt='coin' />
                                <img src={coin} className='coin-2' alt='coin' />
                                <img src={coin} className='coin-3' alt='coin' />
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
                        <h2 className='mt-4'>{I18n.t('myPlace.assets')}</h2>
                        <Card>
                            {balances && balances.length > 0 ? (
                                balances.map(renderAsset)
                            ) : (
                                <div className='d-flex flex-column align-items-center justify-content-center'>
                                    <img src={coinsStacked} alt='Stacked coins' />
                                    <h3 className='mt-2'>{I18n.t('myPlace.noAssets.title')}</h3>
                                    <p className='text-center'>{I18n.t('myPlace.noAssets.description')}</p>
                                    <Button>{I18n.t('myPlace.deposit')}</Button>
                                </div>
                            )}
                        </Card>
                        {activities && activities.length > 0 ? (
                            <div className='mt-4'>
                                <h2>{I18n.t('myPlace.activities')}</h2>
                                <Card>
                                    <div />
                                </Card>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 col-xxl-3'>
                    {prizeToClaim ? (
                        <div className='mt-4 mt-lg-0'>
                            <h2>{I18n.t('myPlace.claimPrize')}</h2>
                            <Card>
                                <div className='d-flex flex-column prize-to-claim'>
                                    <span className='asset-amount'>
                                        <img src={DenomsUtils.getIconFromDenom(prizeToClaim.denom)} className='denom-icon' alt='Denom' />
                                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prizeToClaim.amount)).format('0,0.[00]')} className='me-2' />
                                        {DenomsUtils.getNormalDenom(prizeToClaim.denom).toUpperCase()}
                                    </span>
                                    <Button className='my-place-cta mt-3'>{I18n.t('myPlace.claim')}</Button>
                                </div>
                            </Card>
                        </div>
                    ) : null}
                    <h2 className={prizeToClaim ? 'mt-4' : 'mt-4 mt-lg-0'}>{I18n.t('myPlace.governance')}</h2>
                    <Card>
                        <h3>{I18n.t('myPlace.governanceCard.title')}</h3>
                        <p className='mt-4 mb-5'>{I18n.t('myPlace.governanceCard.description')}</p>
                        <Button className='my-place-cta' onClick={() => window.open(NavigationConstants.DISCORD, '_blank')}>
                            <img src={discordIcon} alt='Discord' className='me-2' />
                            {I18n.t('myPlace.governanceCard.cta')}
                        </Button>
                    </Card>
                </div>
            </div>
            <Modal id='withdrawModal'>
                <form onSubmit={withdrawForm.handleSubmit}>
                    <div className='withdraw-title'>{I18n.t('withdraw.title')}</div>
                    <div className='d-flex flex-column position-relative mt-4'>
                        <div className='address-container mb-3'>{lumWallet?.address}</div>
                        <div className='address-container'>{withdrawForm.values.withdrawAddress}</div>
                        <div className='arrow-container position-absolute top-50 start-50 translate-middle'>
                            <img src={downArrow} alt='down arrow' />
                        </div>
                    </div>
                    <AmountInput
                        className='amount-input'
                        label={I18n.t('withdraw.amountInput.label')}
                        sublabel={
                            withdrawForm.values.denom
                                ? I18n.t('withdraw.amountInput.sublabel', {
                                      amount: NumbersUtils.formatTo6digit(WalletUtils.getMaxAmount(withdrawForm.values.denom, balances)),
                                      denom: DenomsUtils.getNormalDenom(withdrawForm.values.denom).toUpperCase(),
                                  })
                                : undefined
                        }
                        onMax={
                            withdrawForm.values.denom
                                ? () => {
                                      withdrawForm.setFieldValue('amount', WalletUtils.getMaxAmount(withdrawForm.values.denom, balances));
                                  }
                                : undefined
                        }
                        inputProps={{
                            type: 'number',
                            min: 0,
                            max: WalletUtils.getMaxAmount(withdrawForm.values.denom, balances),
                            step: 'any',
                            ...withdrawForm.getFieldProps('amount'),
                        }}
                        price={prices?.[DenomsUtils.getNormalDenom(withdrawForm.values.denom)]}
                        error={withdrawForm.errors.amount}
                    />
                    <AssetsSelect
                        balances={balances || []}
                        value={withdrawForm.values.denom}
                        onChange={async (denom) => await onDenomChange(denom)}
                        options={(balances || [])
                            .filter((balance) => balance.denom !== LumConstants.MicroLumDenom)
                            .map((balance) => ({
                                label: DenomsUtils.getNormalDenom(balance.denom),
                                value: balance.denom,
                            }))}
                    />
                    <Button type='submit' data-bs-dismiss='modal' className='w-100 mt-4'>
                        {I18n.t('myPlace.withdraw')}
                    </Button>
                </form>
            </Modal>
        </>
    );
};

export default MyPlace;
