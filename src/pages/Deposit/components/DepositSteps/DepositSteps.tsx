import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Tooltip } from 'react-tooltip';
import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux/store';
import Skeleton from 'react-loading-skeleton';

import star from 'assets/images/yellow_star.svg';
import infoIcon from 'assets/images/info.svg';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { AmountInput, AssetsSelect, Button, Card } from 'components';
import { LumWalletModel, OsmosisWalletModel } from 'models';
import { NavigationConstants } from 'constant';

interface Props {
    denom: string;
    currentStep: number;
    steps: {
        title: string;
        subtitle: string;
        cardTitle?: string;
        cardSubtitle?: string;
    }[];
    osmosisWallet: OsmosisWalletModel;
    lumWallet: LumWalletModel;
    onNextStep: () => void;
    traceTx: (hash: string) => void;
    initialAmount?: string;
    price?: number;
}

interface StepProps {
    denom: string;
    isLoading?: boolean;
    onNextStep: () => void;
}

const DepositStep1 = (
    props: StepProps & {
        balances: LumTypes.Coin[];
        osmosisAddress: string;
        lumAddress: string;
        onDeposit: (amount: string) => void;
        traceTx: (hash: string) => void;
        price?: number;
    },
) => {
    const { denom, balances, osmosisAddress, lumAddress, onNextStep, onDeposit, traceTx, price } = props;
    const dispatch = useDispatch<Dispatch>();

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
                fromAddress: osmosisAddress,
                toAddress: lumAddress,
                amount: {
                    amount,
                    denom: 'u' + denom,
                },
                normalDenom: denom,
            });

            if (hash) {
                traceTx(hash);
                onNextStep();
            }
        },
    });

    const navigate = useNavigate();

    return (
        <form onSubmit={transferForm.handleSubmit}>
            <AmountInput
                className='amount-input'
                label={I18n.t('withdraw.amountInput.label')}
                sublabel={I18n.t('withdraw.amountInput.sublabel', {
                    amount: NumbersUtils.formatTo6digit(WalletUtils.getMaxAmount('u' + (denom || ''), balances)),
                    denom,
                })}
                onMax={() => {
                    transferForm.setFieldValue('amount', WalletUtils.getMaxAmount('u' + (denom || ''), balances));
                }}
                inputProps={{
                    type: 'number',
                    min: 0,
                    max: WalletUtils.getMaxAmount('u' + (denom || ''), balances),
                    step: 'any',
                    ...transferForm.getFieldProps('amount'),
                }}
                price={price}
                error={transferForm.errors.amount}
            />
            <div className='mt-5'>
                <AssetsSelect
                    balances={balances}
                    value={'u' + (denom || '')}
                    onChange={(value) => {
                        navigate(`/pools/${DenomsUtils.getNormalDenom(value)}`, { replace: true });
                    }}
                    options={balances.map((balance) => ({
                        label: DenomsUtils.getNormalDenom(balance.denom),
                        value: balance.denom,
                    }))}
                />
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
                <Button type='submit' className='deposit-cta w-100 mt-4'>
                    <img src={star} alt='Star' className='me-3' />
                    {I18n.t('deposit.depositBtn')}
                    <img src={star} alt='Star' className='ms-3' />
                </Button>
            </div>
        </form>
    );
};

const DepositStep2 = (props: StepProps & { amount: string; onFinishDeposit: (hash: string) => void; initialAmount?: string }) => {
    const { denom, amount, initialAmount, onNextStep, onFinishDeposit, isLoading } = props;
    const dispatch = useDispatch<Dispatch>();

    const [depositAmount] = useState(initialAmount ? LumUtils.convertUnit({ amount: initialAmount, denom: LumConstants.MicroLumDenom }, LumConstants.LumDenom) : amount);

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
    const { currentStep, steps, lumWallet, osmosisWallet, initialAmount, traceTx, price, ...rest } = props;

    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
            <div className='mb-5 mb-lg-0'>
                <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
            </div>
            {currentStep === 0 && (
                <DepositStep1
                    isLoading={isLoading}
                    price={price}
                    traceTx={traceTx}
                    onDeposit={(amount: string) => {
                        setIsLoading(true);
                        setAmount(amount);

                        setTimeout(() => {
                            setIsLoading(false);
                        }, 30000);
                    }}
                    osmosisAddress={osmosisWallet.address}
                    lumAddress={lumWallet.address}
                    balances={osmosisWallet.balances}
                    {...rest}
                />
            )}
            {currentStep === 1 && <DepositStep2 isLoading={isLoading} initialAmount={initialAmount} amount={amount} onFinishDeposit={(hash) => setTxHash(hash)} {...rest} />}
            {currentStep === 2 && <DepositStep3 txHash={txHash} {...rest} />}
        </div>
    );
};

export default DepositSteps;
