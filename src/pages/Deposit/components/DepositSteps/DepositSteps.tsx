import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Tooltip } from 'react-tooltip';
import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import Skeleton from 'react-loading-skeleton';

import star from 'assets/images/yellow_star.svg';
import infoIcon from 'assets/images/info.svg';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { AmountInput, AssetsSelect, Button, Card } from 'components';
import { LumWalletModel, OtherWalletModel } from 'models';
import { NavigationConstants, PoolsConstants } from 'constant';

interface Props {
    denom: string;
    currentStep: number;
    steps: {
        title: string;
        subtitle: string;
        cardTitle?: string;
        cardSubtitle?: string;
    }[];
    otherWallets: {
        [denom: string]: OtherWalletModel;
    };
    lumWallet: LumWalletModel;
    onNextStep: () => void;
    initialAmount?: string;
    price?: number;
}

interface StepProps {
    denom: string;
    onNextStep: () => void;
}

const DepositStep1 = (
    props: StepProps & {
        otherWallets: {
            [denom: string]: OtherWalletModel;
        };
        lumAddress: string;
        onDeposit: (amount: string) => void;
        price?: number;
    },
) => {
    const { denom, otherWallets, lumAddress, onNextStep, onDeposit, price } = props;
    const dispatch = useDispatch<Dispatch>();

    const otherWallet = otherWallets[denom];
    const walletsNonEmpty = Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0);

    const transferForm = useFormik({
        initialValues: {
            amount: '',
        },
        validationSchema: yup.object().shape({
            amount: yup.string().required(I18n.t('errors.generic.required', { field: 'Amount' })),
        }),
        onSubmit: async (values) => {
            onDeposit(values.amount);

            const amount = values.amount.toString();
            const hash = await dispatch.wallet.ibcTransfer({
                type: 'deposit',
                fromAddress: otherWallet.address,
                toAddress: lumAddress,
                amount: {
                    amount,
                    denom: 'u' + denom,
                },
                normalDenom: PoolsConstants.POOLS[denom].denom,
                ibcChannel: PoolsConstants.POOLS[denom].ibcDestChannel,
            });

            if (hash) {
                onNextStep();
            }
        },
    });

    const navigate = useNavigate();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.ibcTransfer);

    if (!otherWallet) {
        return <div />;
    }

    return (
        <form onSubmit={transferForm.handleSubmit} className={isLoading ? 'd-flex flex-column align-items-stretch w-100' : ''}>
            <div className='w-100'>
                <AmountInput
                    isLoading={isLoading}
                    className='amount-input'
                    label={I18n.t('withdraw.amountInput.label')}
                    sublabel={I18n.t('withdraw.amountInput.sublabel', {
                        amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(otherWallet.balances[0].amount)),
                        denom,
                    })}
                    onMax={() => {
                        transferForm.setFieldValue('amount', otherWallet.balances[0].amount);
                    }}
                    inputProps={{
                        type: 'number',
                        min: 0,
                        max: otherWallet.balances[0].amount,
                        step: 'any',
                        ...transferForm.getFieldProps('amount'),
                    }}
                    price={price}
                    error={transferForm.errors.amount}
                />
            </div>
            <div className='mt-5'>
                <AssetsSelect
                    isLoading={isLoading}
                    balances={walletsNonEmpty.map(({ balances }) => ({
                        denom: balances[0].denom,
                        amount: balances[0].amount,
                    }))}
                    value={'u' + (denom || '')}
                    onChange={(value) => {
                        navigate(`/pools/${DenomsUtils.getNormalDenom(value)}`, { replace: true });
                    }}
                    options={walletsNonEmpty.map((wallet) => ({
                        label: DenomsUtils.getNormalDenom(wallet.balances[0].denom),
                        value: wallet.balances[0].denom,
                    }))}
                />
                {isLoading ? (
                    <Skeleton height={104} className='mt-4' />
                ) : (
                    <Card flat withoutPadding className='mt-4 px-4 py-3'>
                        <div className='winning-chance d-flex flex-row justify-content-between'>
                            <div>
                                {I18n.t('deposit.chancesHint.winning.title')}
                                <span data-tooltip-id='winning-chance-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')} className='ms-2'>
                                    <img src={infoIcon} />
                                    <Tooltip id='winning-chance-tooltip' className='tooltip-light width-400' variant='light' />
                                </span>
                            </div>
                            <div>14%</div>
                        </div>
                        <div className='average-prize d-flex flex-row justify-content-between mt-4'>
                            <div>
                                {I18n.t('deposit.chancesHint.averagePrize.title')}
                                <span data-tooltip-id='average-prize-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.averagePrize.hint')} className='ms-2'>
                                    <img src={infoIcon} />
                                    <Tooltip id='average-prize-tooltip' className='tooltip-light width-400' variant='light' />
                                </span>
                            </div>
                            <div>14 {denom?.toUpperCase()}</div>
                        </div>
                    </Card>
                )}
                <Button type='submit' className='deposit-cta w-100 mt-4' loading={isLoading}>
                    <img src={star} alt='Star' className='me-3' />
                    {I18n.t('deposit.depositBtn')}
                    <img src={star} alt='Star' className='ms-3' />
                </Button>
            </div>
        </form>
    );
};

const DepositStep2 = (props: StepProps & { amount: string; onFinishDeposit: (hash: string) => void; initialAmount?: string }) => {
    const { denom, amount, initialAmount, onNextStep, onFinishDeposit } = props;
    const dispatch = useDispatch<Dispatch>();

    const [depositAmount] = useState(initialAmount ? LumUtils.convertUnit({ amount: initialAmount, denom: LumConstants.MicroLumDenom }, LumConstants.LumDenom) : amount);

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.depositToPool);

    return (
        <div>
            <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between p-4 last-step-card'>
                <span className='asset-info'>
                    <img src={DenomsUtils.getIconFromDenom(denom)} className='me-3' />
                    {denom.toUpperCase()}
                </span>
                <div className='deposit-amount'>{isLoading ? <Skeleton width={20} /> : NumbersUtils.formatTo6digit(depositAmount)}</div>
            </Card>
            <div className='fees-warning mt-4'>
                <img src={infoIcon} className='me-2' height='14' width='14' />
                {I18n.t('deposit.feesWarning')}
            </div>
            <Button
                type='button'
                onClick={async () => {
                    const hash = await dispatch.wallet.depositToPool({ pool: denom, amount: depositAmount });

                    if (hash) {
                        onFinishDeposit(hash);
                        onNextStep();
                    }
                }}
                loading={isLoading}
                className='deposit-cta w-100 mt-4'
            >
                <img src={star} alt='Star' className='me-3' />
                {I18n.t('deposit.saveAndWinBtn')}
                <img src={star} alt='Star' className='ms-3' />
            </Button>
        </div>
    );
};

const DepositStep3 = ({ txHash }: { txHash: string }) => {
    const navigate = useNavigate();

    return (
        <div className='d-flex flex-column px-5 px-lg-0 px-xl-5 mt-5'>
            <Button className='deposit-cta'>
                <img src={star} alt='Star' className='me-3' />
                {I18n.t('deposit.shareTwitter')}
                <img src={star} alt='Star' className='ms-3' />
            </Button>
            <Button
                outline
                className='mt-4'
                onClick={() => {
                    navigate('/my-place');
                }}
            >
                {I18n.t('deposit.goToMyPlace')}
            </Button>
            <Button
                outline
                className='mt-4'
                onClick={() => {
                    window.open('https://mintscan.io/osmosis/gamm/pools/1', '_blank');
                }}
            >
                {I18n.t('deposit.seeOnMintscan')}
            </Button>
            <Button
                outline
                className='mt-4'
                onClick={() => {
                    window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${txHash}`);
                }}
            >
                {I18n.t('deposit.seeOnExplorer')}
            </Button>
        </div>
    );
};

const DepositSteps = (props: Props) => {
    const { currentStep, steps, lumWallet, otherWallets, initialAmount, price, ...rest } = props;

    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');

    return (
        <div className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
            <div className='mb-5 mb-lg-0'>
                <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
            </div>
            {currentStep === 0 && <DepositStep1 price={price} onDeposit={(amount: string) => setAmount(amount)} otherWallets={otherWallets} lumAddress={lumWallet.address} {...rest} />}
            {currentStep === 1 && <DepositStep2 initialAmount={initialAmount} amount={amount} onFinishDeposit={(hash) => setTxHash(hash)} {...rest} />}
            {currentStep === 2 && <DepositStep3 txHash={txHash} {...rest} />}
        </div>
    );
};

export default DepositSteps;
