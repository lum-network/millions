import React, { useEffect, useRef, useState } from 'react';
import { FormikProps } from 'formik';
import { Tooltip } from 'react-tooltip';
import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import Skeleton from 'react-loading-skeleton';

import Assets from 'assets';

import { DenomsUtils, I18n, NumbersUtils, ToastUtils, WalletUtils } from 'utils';
import { AmountInput, AssetsSelect, Button, Card, PoolSelect, SmallerDecimal } from 'components';
import { LumWalletModel, OtherWalletModel, PoolModel } from 'models';
import { NavigationConstants } from 'constant';

import './DepositSteps.scss';

interface StepProps {
    currentPool: PoolModel;
    balances: LumTypes.Coin[];
    price?: number;
}

interface Props {
    currentPool: PoolModel;
    pools: PoolModel[];
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
    onPrevStep: (amount: string) => void;
    lumWallet: LumWalletModel;
    transferForm: FormikProps<{ amount: string }>;
    initialAmount?: string;
    price?: number;
}

const DepositStep1 = (
    props: StepProps & {
        nonEmptyWallets: OtherWalletModel[];
        form: FormikProps<{ amount: string }>;
        onDeposit: (amount: string) => void;
    },
) => {
    const { currentPool, balances, price, form, nonEmptyWallets, onDeposit } = props;

    const navigate = useNavigate();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.ibcTransfer);

    return (
        <form onSubmit={form.handleSubmit} className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
            <div className='w-100 mt-5'>
                <AmountInput
                    isLoading={isLoading}
                    label={I18n.t('withdraw.amountInput.label')}
                    sublabel={I18n.t('withdraw.amountInput.sublabel', {
                        amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.length > 0 ? balances[0].amount : '0')),
                        denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase(),
                    })}
                    onMax={() => {
                        const amount = WalletUtils.getMaxAmount(currentPool.nativeDenom, balances);
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
                    price={price}
                    error={form.errors.amount}
                />
            </div>
            <div className='mt-5'>
                <AssetsSelect
                    isLoading={isLoading}
                    balances={nonEmptyWallets.reduce<{ amount: string; denom: string }[]>((result, { balances }) => {
                        if (balances.length > 0) {
                            result.push({
                                amount: balances[0].amount,
                                denom: balances[0].denom,
                            });
                        }
                        return result;
                    }, [])}
                    value={currentPool.nativeDenom}
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
                    <Card flat withoutPadding className='winning-chance-card mt-4 px-4'>
                        <div className='winning-chance d-flex flex-row justify-content-between'>
                            <div>
                                {I18n.t('deposit.chancesHint.winning.title')}
                                <span data-tooltip-id='winning-chance-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')} className='ms-2'>
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='winning-chance-tooltip' className='tooltip-light width-400' variant='light' />
                                </span>
                            </div>
                            <div>14%</div>
                        </div>
                        <div className='average-prize d-flex flex-row justify-content-between mt-4'>
                            <div>
                                {I18n.t('deposit.chancesHint.averagePrize.title')}
                                <span data-tooltip-id='average-prize-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.averagePrize.hint')} className='ms-2'>
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='average-prize-tooltip' className='tooltip-light width-400' variant='light' />
                                </span>
                            </div>
                            <div>14 {DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase()}</div>
                        </div>
                    </Card>
                )}
                <Button type={isLoading ? 'button' : 'submit'} onClick={() => onDeposit(form.values.amount)} className='deposit-cta w-100 mt-4' disabled={isLoading} loading={isLoading}>
                    <img src={Assets.images.yellowStar} alt='Star' className='me-3' />
                    {I18n.t('deposit.depositBtn')}
                    <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
                </Button>
            </div>
        </form>
    );
};

const DepositStep2 = (
    props: StepProps & { amount: string; onFinishDeposit: (hash: string) => void; initialAmount?: string; onNextStep: () => void; onPrevStep: (amount: string) => void; pools: PoolModel[] },
) => {
    const { pools, currentPool, price, balances, amount, initialAmount, onNextStep, onPrevStep, onFinishDeposit } = props;

    const dispatch = useDispatch<Dispatch>();
    const navigate = useNavigate();
    const { denom } = useParams<NavigationConstants.PoolsParams>();

    const containerRef = useRef<HTMLDivElement>(null);
    const [depositAmount, setDepositAmount] = useState<string>(
        initialAmount
            ? (NumbersUtils.convertUnitNumber(initialAmount, LumConstants.MicroLumDenom, LumConstants.LumDenom) - (currentPool.nativeDenom === LumConstants.MicroLumDenom ? 0.005 : 0)).toFixed(6)
            : amount,
    );
    const [poolToDeposit, setPoolToDeposit] = useState(currentPool);
    const [isModifying, setIsModifying] = useState(false);
    const [error, setError] = useState('');
    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.depositToPool);

    useEffect(() => {
        const depositAmountNumber = Number(depositAmount);

        if (Number.isNaN(depositAmount)) {
            setError(I18n.t('errors.generic.invalid', { field: 'deposit amount' }));
        } else {
            if (depositAmountNumber < Number(poolToDeposit.minDepositAmount)) {
                setError(I18n.t('errors.deposit.lessThanMinDeposit', { minDeposit: poolToDeposit.minDepositAmount }));
            } else {
                setError('');
            }
        }
    }, [depositAmount]);

    useEffect(() => {
        const handler = ({ key }: KeyboardEvent) => {
            if (key === 'Enter' && !error && !isLoading) {
                setIsModifying(false);
            }
        };

        if (containerRef.current) {
            const input = containerRef.current.querySelector('input');

            if (input) {
                input.addEventListener('keyup', handler);
            }
        }

        return () => {
            if (containerRef.current) {
                const input = containerRef.current.querySelector('input');

                if (input) {
                    input.removeEventListener('keyup', handler);
                }
            }
        };
    }, [containerRef]);

    return (
        <div className='step-2' ref={containerRef}>
            <Card flat withoutPadding className='deposit-warning mt-4'>
                <div dangerouslySetInnerHTML={{ __html: I18n.t('deposit.depositWarning') }} />
            </Card>
            <div className='d-flex flex-row justify-content-between mt-4'>
                <label className='label'>{I18n.t('deposit.depositLabel', { denom: DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase() })}</label>
                <Button textOnly onClick={() => setIsModifying(true)}>
                    Modify
                </Button>
            </div>
            {isModifying ? (
                <AmountInput
                    isLoading={isLoading}
                    className='mt-2'
                    onMax={() => {
                        const amount = WalletUtils.getMaxAmount(poolToDeposit.nativeDenom, balances);
                        setDepositAmount(amount);
                    }}
                    inputProps={{
                        type: 'number',
                        min: 0,
                        value: depositAmount,
                        onChange: (e) => {
                            setDepositAmount(e.target.value);
                        },
                        max: balances.length > 0 ? balances[0].amount : '0',
                        step: 'any',
                        lang: 'en',
                    }}
                    price={price}
                    error={error}
                />
            ) : (
                <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3 last-step-card mt-2'>
                    <span className='asset-info'>
                        <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom))} className='me-3' alt='denom' />
                        {DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase()}
                    </span>
                    <div className='deposit-amount'>{isLoading ? <Skeleton width={20} /> : <SmallerDecimal nb={NumbersUtils.formatTo6digit(depositAmount)} />}</div>
                </Card>
            )}
            {pools.length > 1 && (
                <PoolSelect
                    className='mt-4'
                    pools={pools}
                    options={pools.map((pool) => ({
                        value: pool.poolId.toString(),
                        label: `${DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()} - Pool #${pool.poolId.toString()}`,
                    }))}
                    value={poolToDeposit.poolId.toString()}
                    onChange={(value) => {
                        navigate(`${NavigationConstants.POOLS}/${denom}/${value}`);
                        setPoolToDeposit(pools.find((p) => p.poolId.toString() === value) || poolToDeposit);
                    }}
                />
            )}
            <Card flat withoutPadding className='fees-warning mt-4'>
                <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                    <img src={Assets.images.info} alt='info' />
                    <Tooltip id='fees-tooltip' className='tooltip-light width-400' variant='light' />
                </span>
                {I18n.t('deposit.feesWarning')}
            </Card>
            <Button
                type='button'
                onClick={async () => {
                    const maxAmount = Number(WalletUtils.getMaxAmount(poolToDeposit.nativeDenom, balances));

                    if (Number(depositAmount) > maxAmount) {
                        onPrevStep(depositAmount);
                        return;
                    }
                    const res = await dispatch.wallet.depositToPool({ pool: poolToDeposit, amount: depositAmount });

                    if (res && res.error) {
                        ToastUtils.showErrorToast({ content: res.error });
                    } else if (res && res.hash) {
                        onFinishDeposit(LumUtils.toHex(res.hash).toUpperCase());
                        onNextStep();
                    }
                }}
                loading={isLoading}
                className='deposit-cta w-100 mt-4'
            >
                <img src={Assets.images.yellowStar} alt='Star' className='me-3' />
                {I18n.t('deposit.saveAndWinBtn')}
                <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
            </Button>
        </div>
    );
};

const DepositStep3 = ({ txHash }: { txHash: string }) => {
    const navigate = useNavigate();

    return (
        <div className='step-3 d-flex flex-column px-5 px-lg-0 px-xl-4 mt-5'>
            <div className='row row-cols-3'>
                <div className='col step-3-cta-container'>
                    <button
                        className='scale-hover d-flex flex-column align-items-center justify-content-center mx-auto'
                        onClick={() => {
                            window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${txHash}`, '_blank');
                        }}
                    >
                        <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                            <img src={Assets.images.lumLogoPurple} alt='Lum Network logo purple' />
                        </div>
                        {I18n.t('deposit.seeOnExplorer')}
                    </button>
                </div>
                <div className='col step-3-cta-container'>
                    <button
                        className='scale-hover d-flex flex-column align-items-center justify-content-center mx-auto'
                        onClick={() => {
                            window.open(`${NavigationConstants.MINTSCAN}/txs/${txHash}`, '_blank');
                        }}
                    >
                        <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                            <img src={Assets.images.mintscanPurple} alt='Mintscan' />
                        </div>
                        {I18n.t('deposit.seeOnMintscan')}
                    </button>
                </div>
                <div className='col step-3-cta-container'>
                    <button
                        className='scale-hover d-flex flex-column align-items-center justify-content-center mx-auto'
                        onClick={() => {
                            navigate(NavigationConstants.MY_SAVINGS);
                        }}
                    >
                        <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                            <img src={Assets.images.mySavings} alt='My savings' />
                        </div>
                        {I18n.t('deposit.goToMySavings')}
                    </button>
                </div>
            </div>
            <Button
                className='deposit-cta mt-5'
                onClick={() => {
                    window.open(`${NavigationConstants.TWEET_URL}?text=${encodeURI(I18n.t('deposit.shareTwitterContent'))}`, '_blank');
                }}
            >
                <img src={Assets.images.twitterWhite} alt='Twitter' className='me-3' width={25} />
                {I18n.t('deposit.shareTwitter')}
            </Button>
        </div>
    );
};

const DepositSteps = (props: Props) => {
    const { currentStep, steps, otherWallets, initialAmount, price, pools, currentPool, onNextStep, onPrevStep, transferForm, lumWallet } = props;

    const [amount, setAmount] = useState('');
    const [txHash, setTxHash] = useState('');
    const [otherWallet, setOtherWallet] = useState<OtherWalletModel | undefined>(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
    const [nonEmptyWallets, setNonEmptyWallets] = useState(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));

    useEffect(() => {
        setOtherWallet(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
        setNonEmptyWallets(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));
    }, [otherWallets, currentPool]);

    return (
        <>
            <div className='deposit-steps h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
                <div className='mb-5 mb-lg-0'>
                    <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                    <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
                </div>
                {currentStep === 0 && (
                    <DepositStep1
                        currentPool={currentPool}
                        form={transferForm}
                        onDeposit={(amount) => setAmount(amount)}
                        price={price}
                        balances={(currentPool.nativeDenom === LumConstants.MicroLumDenom ? lumWallet?.balances : otherWallet?.balances) || []}
                        nonEmptyWallets={nonEmptyWallets}
                    />
                )}
                {currentStep === 1 && (
                    <DepositStep2
                        balances={(currentPool.nativeDenom === LumConstants.MicroLumDenom ? lumWallet?.balances : otherWallet?.balances) || []}
                        initialAmount={initialAmount}
                        amount={amount}
                        onFinishDeposit={(hash) => setTxHash(hash)}
                        currentPool={currentPool}
                        pools={pools}
                        price={price}
                        onNextStep={onNextStep}
                        onPrevStep={onPrevStep}
                    />
                )}
                {currentStep === 2 && <DepositStep3 txHash={txHash} />}
            </div>
        </>
    );
};

export default DepositSteps;
