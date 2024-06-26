import React, { useEffect, useMemo, useState } from 'react';
import { Coin, MICRO_LUM_DENOM } from '@lum-network/sdk-javascript';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Assets from 'assets';
import { AmountInput, AssetsSelect, Button, Card, Modal, Steps, Tooltip } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { FirebaseConstants } from 'constant';
import { DenomsUtils, I18n, LumClient, NumbersUtils, WalletUtils, Firebase, ToastUtils } from 'utils';
import { LumWalletModel, OtherWalletModel, PoolModel } from 'models';
import { Dispatch } from 'redux/store';

interface Props {
    asset: string | null;
    isLoading: boolean;
    lumWallet: LumWalletModel;
    otherWallets: { [key: string]: OtherWalletModel | undefined };
    pools: PoolModel[];
    balances: Coin[];
    prices: { [key: string]: number };
    modalRef: React.RefObject<ModalHandlers>;
}

const TransferOut = ({ lumWallet, otherWallets, asset, isLoading, balances, prices, pools, modalRef }: Props) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [assetToTransfer, setAssetToTransfer] = useState<string>(asset || '');

    const dispatch = useDispatch<Dispatch>();

    const form = useFormik({
        initialValues: {
            withdrawAddress: otherWallets[DenomsUtils.getNormalDenom(assetToTransfer)]?.address || '',
            denom: assetToTransfer,
            amount: '',
        },
        validationSchema: yup.object().shape({
            withdrawAddress: yup.string().required(I18n.t('errors.generic.required', { field: 'Withdraw address' })),
            denom: yup.string().required(I18n.t('errors.generic.required', { field: 'Asset' })),
            amount: yup.string().required(I18n.t('errors.generic.required', { field: 'Amount' })),
        }),
        onSubmit: async (values) => {
            const normalDenom = DenomsUtils.getNormalDenom(values.denom);
            const amount = values.amount.toString();
            const pool = pools.find((pool) => pool.nativeDenom === values.denom);

            if (!pool) {
                ToastUtils.showErrorToast({ content: normalDenom.toUpperCase() + ' Pool not found' });
                return;
            }

            if (!pool.internalInfos) {
                ToastUtils.showErrorToast({ content: normalDenom.toUpperCase() + ' Pool infos not found' });
                return;
            }

            if (!values.withdrawAddress) {
                ToastUtils.showErrorToast({ content: 'Invalid withdraw address' });
                return;
            }

            setCurrentStep(currentStep + 1);

            const res = await dispatch.wallet.ibcTransfer({
                toAddress: values.withdrawAddress,
                fromAddress: lumWallet.address,
                type: 'withdraw',
                amount: {
                    amount,
                    denom: pool.chainId.includes('testnet') || pool.chainId.includes('devnet') ? pool.internalInfos.ibcTestnetDenom : pool.internalInfos.ibcDenom,
                },
                normalDenom: normalDenom,
                ibcChannel: pool.transferChannelId,
                chainId: LumClient.getChainId() || '',
            });

            if (res && !res.error) {
                if (modalRef.current) {
                    modalRef.current.hide();
                }
            } else {
                setCurrentStep(currentStep);
            }
        },
    });

    useEffect(() => {
        if (asset) {
            setAssetToTransfer(asset);
            form.setFieldValue('denom', asset);
            form.setFieldValue('withdrawAddress', otherWallets[DenomsUtils.getNormalDenom(asset)]?.address || '');
        }
    }, [asset]);

    useEffect(() => {
        const handler = () => {
            setCurrentStep(0);
            setAssetToTransfer('');
        };

        const withdrawModal = document.getElementById('#withdrawModal');

        if (withdrawModal) {
            withdrawModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (withdrawModal) {
                withdrawModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    const steps = I18n.t('mySavings.transferOutModal.steps', {
        returnObjects: true,
        provider: WalletUtils.getAutoconnectProvider(),
    });

    const balance = useMemo(() => balances.find((balance) => balance.denom === form.values.denom), [form]);

    return (
        <Modal id='withdrawModal' ref={modalRef} modalWidth={1080}>
            <div className='row row-cols-1 row-cols-lg-2'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('mySavings.transferOutModal.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className='col'>
                    <Card withoutPadding className='d-flex flex-column justify-content-between px-3 px-sm-5 py-3 flex-grow-1 glow-bg mt-5 mt-lg-0'>
                        <div className='h-100 d-flex flex-column text-center py-sm-4'>
                            <div className='mb-3 mb-sm-5 mb-lg-0'>
                                <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                                <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
                            </div>
                            <form onSubmit={form.handleSubmit} className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
                                <div className='w-100'>
                                    <AmountInput
                                        isLoading={isLoading}
                                        className='mt-5'
                                        label={I18n.t('mySavings.transferOutModal.amountInput.label')}
                                        sublabel={I18n.t('mySavings.transferOutModal.amountInput.sublabel', {
                                            amount: balance ? NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balance.amount, balance.denom)) : 0,
                                            denom: DenomsUtils.getNormalDenom(form.values.denom).toUpperCase(),
                                        })}
                                        onMax={() => {
                                            const amount = WalletUtils.getMaxAmount(form.values.denom, balances);
                                            form.setFieldValue('amount', amount);
                                        }}
                                        inputProps={{
                                            type: 'number',
                                            min: 0,
                                            max: balances.length > 0 ? balances[0].amount : '0',
                                            step: 'any',
                                            lang: 'en',
                                            ...form.getFieldProps('amount'),
                                        }}
                                        price={prices[DenomsUtils.getNormalDenom(form.values.denom)]}
                                        error={form.touched.amount ? form.errors.amount : ''}
                                    />
                                </div>
                                <div className='mt-4'>
                                    <AssetsSelect
                                        isLoading={isLoading}
                                        balances={balances}
                                        value={form.values.denom}
                                        onChange={(value) => {
                                            form.setFieldValue('denom', value);
                                        }}
                                        options={balances
                                            .filter((balance) => balance.denom !== MICRO_LUM_DENOM)
                                            .map((balance) => ({
                                                label: DenomsUtils.getNormalDenom(balance.denom),
                                                value: balance.denom,
                                            }))}
                                    />
                                    <Card flat withoutPadding className='fees-warning mt-4'>
                                        <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                            <img src={Assets.images.info} alt='info' />
                                            <Tooltip id='fees-tooltip' delay={2000} />
                                        </span>
                                        {I18n.t('deposit.feesWarning')}
                                    </Card>
                                    <Button
                                        type='submit'
                                        className='w-100 mt-4'
                                        disabled={isLoading}
                                        loading={isLoading}
                                        onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TRANSFER_OUT_CONFIRMED)}
                                        forcePurple
                                    >
                                        {I18n.t('mySavings.transferOutModal.cta')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default TransferOut;
