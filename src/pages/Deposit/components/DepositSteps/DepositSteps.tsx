import React, { useState } from 'react';
import { FormikProps } from 'formik';
import { Tooltip } from 'react-tooltip';
import { LumConstants, LumUtils } from '@lum-network/sdk-javascript';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import Skeleton from 'react-loading-skeleton';

import star from 'assets/images/yellow_star.svg';
import infoIcon from 'assets/images/info.svg';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { AmountInput, AssetsSelect, Button, Card, SmallerDecimal } from 'components';
import { LumWalletModel, OtherWalletModel } from 'models';
import { NavigationConstants, PoolsConstants } from 'constant';

interface StepProps {
    denom: string;
}

interface Props extends StepProps {
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
    onNextStep: () => void;
    lumWallet: LumWalletModel;
    transferForm: FormikProps<{ amount: string }>;
    initialAmount?: string;
    price?: number;
}

const DepositStep1 = (
    props: StepProps & {
        otherWallet: OtherWalletModel;
        nonEmptyWallets: OtherWalletModel[];
        form: FormikProps<{ amount: string }>;
        onDeposit: (amount: string) => void;
        price?: number;
    },
) => {
    const { denom, otherWallet, price, form, nonEmptyWallets, onDeposit } = props;

    const navigate = useNavigate();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.ibcTransfer);

    if (!otherWallet) {
        return <div />;
    }

    return (
        <form onSubmit={form.handleSubmit} className={isLoading ? 'd-flex flex-column align-items-stretch w-100' : ''}>
            <div className='w-100 mt-5'>
                <AmountInput
                    isLoading={isLoading}
                    className='amount-input'
                    label={I18n.t('withdraw.amountInput.label')}
                    sublabel={I18n.t('withdraw.amountInput.sublabel', {
                        amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(otherWallet.balances[0].amount)),
                        denom: denom.toUpperCase(),
                    })}
                    onMax={() => {
                        form.setFieldValue('amount', WalletUtils.getMaxAmount(PoolsConstants.POOLS[denom].minimalDenom, otherWallet.balances));
                    }}
                    inputProps={{
                        type: 'number',
                        min: 0,
                        max: otherWallet.balances[0].amount,
                        step: 'any',
                        ...form.getFieldProps('amount'),
                    }}
                    price={price}
                    error={form.errors.amount}
                />
            </div>
            <div className='mt-5'>
                <AssetsSelect
                    isLoading={isLoading}
                    balances={nonEmptyWallets.map(({ balances }) => ({
                        denom: balances[0].denom,
                        amount: balances[0].amount,
                    }))}
                    value={'u' + (denom || '')}
                    onChange={(value) => {
                        navigate(`/pools/${DenomsUtils.getNormalDenom(value)}`, { replace: true });
                    }}
                    options={nonEmptyWallets.map((wallet) => ({
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
                <Button type='submit' onClick={() => onDeposit(form.values.amount)} className='deposit-cta w-100 mt-4' loading={isLoading}>
                    <img src={star} alt='Star' className='me-3' />
                    {I18n.t('deposit.depositBtn')}
                    <img src={star} alt='Star' className='ms-3' />
                </Button>
            </div>
        </form>
    );
};

const DepositStep2 = (props: StepProps & { amount: string; onFinishDeposit: (hash: string) => void; initialAmount?: string; onNextStep: () => void }) => {
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
                <div className='deposit-amount'>{isLoading ? <Skeleton width={20} /> : <SmallerDecimal nb={NumbersUtils.formatTo6digit(depositAmount)} />}</div>
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
            <Button
                className='deposit-cta'
                onClick={() => {
                    window.open(`${NavigationConstants.TWEET_URL}?text=${encodeURI(I18n.t('deposit.shareTwitterContent'))}`, '_blank');
                }}
            >
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
                    window.open(`${NavigationConstants.MINTSCAN}/txs/${txHash}`, '_blank');
                }}
            >
                {I18n.t('deposit.seeOnMintscan')}
            </Button>
            <Button
                outline
                className='mt-4'
                onClick={() => {
                    window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${txHash}`, '_blank');
                }}
            >
                {I18n.t('deposit.seeOnExplorer')}
            </Button>
        </div>
    );
};

const DepositSteps = (props: Props) => {
    const { currentStep, steps, otherWallets, initialAmount, price, denom, onNextStep, transferForm } = props;

    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');

    const otherWallet = otherWallets[denom];
    const nonEmptyWallets = Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0);

    return (
        <>
            <div className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
                <div className='mb-5 mb-lg-0'>
                    <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                    <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
                </div>
                {currentStep === 0 && (
                    <DepositStep1 form={transferForm} onDeposit={(amount) => setAmount(amount)} price={price} otherWallet={otherWallet} nonEmptyWallets={nonEmptyWallets} denom={denom} />
                )}
                {currentStep === 1 && <DepositStep2 initialAmount={initialAmount} amount={amount} onFinishDeposit={(hash) => setTxHash(hash)} denom={denom} onNextStep={onNextStep} />}
                {currentStep === 2 && <DepositStep3 txHash={txHash} />}
            </div>
        </>
    );
};

export default DepositSteps;
