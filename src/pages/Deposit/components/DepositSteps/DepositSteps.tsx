import React, { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/deposit';
import numeral from 'numeral';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Assets from 'assets';

import { AmountInput, AssetsSelect, Button, Card, PoolSelect, SmallerDecimal, Tooltip } from 'components';
import { NavigationConstants } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils, PoolsUtils, WalletUtils } from 'utils';

import './DepositSteps.scss';

interface StepProps {
    currentPool: PoolModel;
    balances: LumTypes.Coin[];
    price: number;
    pools: PoolModel[];
    title: string;
    subtitle: string;
    disabled: boolean;
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
    onDeposit: (poolToDeposit: PoolModel, depositAmount: string) => Promise<{ hash: Uint8Array; error: string | null | undefined } | null>;
    onFinishDeposit: (callback: () => void) => void;
    onTwitterShare: () => void;
    lumWallet: LumWalletModel | null;
    transferForm: FormikProps<{ amount: string }>;
    price: number;
    amountFromLocationState?: number;
}

type TxInfos = {
    hash: string;
    amount: string;
    denom: string;
    tvl: string;
    poolId: string;
};

const DepositStep1 = (
    props: StepProps & {
        nonEmptyWallets: OtherWalletModel[];
        form: FormikProps<{ amount: string }>;
        onTransfer: (amount: string) => void;
    },
) => {
    const { currentPool, balances, price, pools, form, nonEmptyWallets, title, subtitle, disabled, onTransfer } = props;

    const navigate = useNavigate();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.ibcTransfer);
    const prizeStrat = currentPool.prizeStrategy;

    let avgPrize = 0;

    if (prizeStrat) {
        let avgPrizesDrawn = 0;
        for (const prizeBatch of prizeStrat.prizeBatches) {
            avgPrizesDrawn += (Number(currentPool.estimatedPrizeToWin?.amount || '0') * (prizeBatch.poolPercent.toNumber() / 100)) / prizeBatch.quantity.toNumber();
        }

        avgPrize = avgPrizesDrawn / prizeStrat.prizeBatches.length / prizeStrat.prizeBatches.length;
    }

    return (
        <div className={`step-1 ${disabled && 'disabled'}`}>
            <div className='d-flex flex-column mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title' dangerouslySetInnerHTML={{ __html: title }} />
                <div className='card-step-subtitle' dangerouslySetInnerHTML={{ __html: subtitle }} />
            </div>
            <form onSubmit={form.handleSubmit} className={isLoading ? 'd-flex flex-column align-items-stretch w-100' : ''}>
                <div className='w-100 mt-5'>
                    <AmountInput
                        isLoading={isLoading}
                        label={I18n.t('withdraw.amountInput.label')}
                        sublabel={I18n.t('withdraw.amountInput.sublabel', {
                            amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.length > 0 ? balances[0].amount : '0')),
                            denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase(),
                        })}
                        onMax={() => {
                            const amount = WalletUtils.getMaxAmount(currentPool.nativeDenom, balances, currentPool.internalInfos?.fees);
                            form.setFieldValue('amount', amount);
                        }}
                        inputProps={{
                            type: 'number',
                            min: 0,
                            max: balances.length > 0 ? balances[0].amount : '0',
                            step: 'any',
                            lang: 'en',
                            placeholder: (100 / price).toFixed(6),
                            disabled,
                            ...form.getFieldProps('amount'),
                            onChange: (e) => {
                                const inputAmount = Number(e.target.value);
                                const maxAmount = Number(WalletUtils.getMaxAmount(currentPool.nativeDenom, balances, currentPool.internalInfos?.fees));

                                if (Number.isNaN(inputAmount) || inputAmount < 0) {
                                    e.target.value = '0';
                                } else if (inputAmount > maxAmount) {
                                    e.target.value = maxAmount > 0 ? maxAmount.toString() : '0';
                                }

                                form.handleChange(e);
                            },
                        }}
                        price={price}
                        error={form.touched.amount ? form.errors.amount : ''}
                    />
                </div>
                <div className='mt-5'>
                    {pools.filter((p) => p.nativeDenom !== LumConstants.MicroLumDenom).length > 1 && (
                        <AssetsSelect
                            className='asset-select'
                            isLoading={isLoading}
                            disabled={disabled}
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
                    )}
                    <Card flat withoutPadding className='winning-chance-card mt-4 px-4'>
                        <div className='winning-chance d-flex flex-row justify-content-between'>
                            <div className='text-start'>
                                {I18n.t('deposit.chancesHint.winning.title')}
                                <span
                                    data-tooltip-id='winning-chance-tooltip'
                                    data-tooltip-place='left'
                                    data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')}
                                    className='deposit-tooltip ms-2'
                                >
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='winning-chance-tooltip' />
                                </span>
                            </div>
                            <div>{NumbersUtils.float2ratio(PoolsUtils.getWinningChances(form.values.amount ? Number(form.values.amount) : 100 / price, currentPool))}</div>
                        </div>
                        <div className='average-prize d-flex flex-row justify-content-between mt-4'>
                            <div className='text-start'>
                                {I18n.t('deposit.chancesHint.averagePrize.title')}
                                <span data-tooltip-id='average-prize-tooltip' data-tooltip-place='left' data-tooltip-html={I18n.t('deposit.chancesHint.averagePrize.hint')} className='ms-2'>
                                    <img src={Assets.images.info} alt='info' />
                                    <Tooltip id='average-prize-tooltip' />
                                </span>
                            </div>
                            <div>
                                {avgPrize.toFixed(2)} {DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase()}
                            </div>
                        </div>
                    </Card>
                    <Button
                        type={isLoading ? 'button' : 'submit'}
                        onClick={() => onTransfer(form.values.amount)}
                        className='position-relative deposit-cta w-100 mt-4'
                        disabled={disabled || isLoading || !!(form.touched.amount && form.errors.amount)}
                    >
                        <div className='position-absolute deposit-cta-bg w-100 h-100' />
                        <div className='deposit-cta-text'>{I18n.t('deposit.transferBtn')}</div>
                    </Button>
                </div>
            </form>
        </div>
    );
};

const DepositStep2 = (
    props: StepProps & {
        amount: string;
        onDeposit: (poolToDeposit: PoolModel, depositAmount: string) => Promise<void>;
        initialAmount?: string;
    },
) => {
    const { pools, currentPool, price, balances, amount, initialAmount, title, subtitle, disabled, onDeposit } = props;

    const navigate = useNavigate();
    const { denom } = useParams<NavigationConstants.PoolsParams>();

    const [depositAmount, setDepositAmount] = useState<string>(
        initialAmount
            ? (NumbersUtils.convertUnitNumber(initialAmount, LumConstants.MicroLumDenom, LumConstants.LumDenom) - (currentPool.nativeDenom === LumConstants.MicroLumDenom ? 0.005 : 0)).toFixed(6)
            : amount,
    );
    const [poolToDeposit, setPoolToDeposit] = useState(currentPool);
    const [isModifying, setIsModifying] = useState(currentPool.nativeDenom === LumConstants.MicroLumDenom);
    const [error, setError] = useState('');

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.depositToPool);

    const validateInput = (value: string) => {
        const depositAmountNumber = Number(value);

        if (Number.isNaN(depositAmountNumber)) {
            setError(I18n.t('errors.generic.invalid', { field: 'deposit amount' }));
        } else {
            setError('');
        }
    };

    useEffect(() => {
        if (initialAmount) {
            setDepositAmount(
                (NumbersUtils.convertUnitNumber(initialAmount, LumConstants.MicroLumDenom, LumConstants.LumDenom) - (currentPool.nativeDenom === LumConstants.MicroLumDenom ? 0.005 : 0)).toFixed(6),
            );
        }
    }, [initialAmount]);

    useEffect(() => {
        const handler = ({ key }: KeyboardEvent) => {
            if (key === 'Enter' && !error && !isLoading) {
                setIsModifying(false);
            }
        };

        document.addEventListener('keyup', handler);

        return () => {
            document.removeEventListener('keyup', handler);
        };
    }, []);

    return (
        <div className={`step-2 ${disabled && 'disabled'}`}>
            <div className='d-flex flex-column mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title' dangerouslySetInnerHTML={{ __html: title }} />
                <div className='card-step-subtitle' dangerouslySetInnerHTML={{ __html: subtitle }} />
            </div>
            <Card flat withoutPadding className='deposit-warning mt-4'>
                <div
                    dangerouslySetInnerHTML={{
                        __html: I18n.t('deposit.depositWarning', { unbondingTime: currentPool?.internalInfos?.unbondingTime || 21, lockTime: (currentPool?.internalInfos?.unbondingTime || 21) + 3 }),
                    }}
                />
            </Card>
            <div className='step2-input-container'>
                <div className='d-flex flex-row justify-content-between align-items-baseline mt-4'>
                    <label className='label text-start'>{I18n.t('deposit.depositLabel', { denom: DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase() })}</label>
                    {!isModifying ? (
                        <Button textOnly onClick={() => setIsModifying(true)}>
                            {I18n.t('common.edit')}
                        </Button>
                    ) : (
                        <label className='sublabel'>
                            {I18n.t('withdraw.amountInput.sublabel', {
                                amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.find((b) => b.denom === poolToDeposit.nativeDenom)?.amount || '0')),
                                denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase(),
                            })}
                        </label>
                    )}
                </div>
                {isModifying ? (
                    <AmountInput
                        isLoading={isLoading}
                        className='mt-2'
                        onMax={() => {
                            const amount = WalletUtils.getMaxAmount(
                                poolToDeposit.nativeDenom,
                                balances,
                                poolToDeposit.nativeDenom === LumConstants.MicroLumDenom ? 0.05 : poolToDeposit.internalInfos?.fees,
                            );
                            setDepositAmount(amount);
                        }}
                        inputProps={{
                            type: 'number',
                            min: 0,
                            value: Number(depositAmount) < 0 ? '0' : depositAmount,
                            onChange: (e) => {
                                setDepositAmount(e.target.value);
                                validateInput(e.target.value);
                            },
                            max: balances.length > 0 ? balances[0].amount : '0',
                            step: 'any',
                            lang: 'en',
                            disabled,
                        }}
                        price={price}
                        error={error}
                    />
                ) : (
                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3 last-step-card mt-2'>
                        <div className='asset-info d-flex flex-row'>
                            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom))} className='me-3 no-filter' alt='denom' />
                            <span className='d-none d-sm-block'>{DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase()}</span>
                        </div>
                        <div className='deposit-amount'>{<SmallerDecimal nb={NumbersUtils.formatTo6digit(depositAmount)} />}</div>
                    </Card>
                )}
            </div>
            {pools.length > 1 && (
                <PoolSelect
                    className='mt-4 pool-select'
                    disabled={disabled}
                    pools={pools}
                    options={pools.map((pool) => ({
                        value: pool.poolId.toString(),
                        label: `${DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase()} - ${I18n.t('pools.poolId', { poolId: pool.poolId.toString() })}`,
                    }))}
                    value={poolToDeposit.poolId.toString()}
                    onChange={(value) => {
                        navigate(`${NavigationConstants.POOLS}/${denom}/${value}`);
                        setPoolToDeposit(pools.find((p) => p.poolId.toString() === value) || poolToDeposit);
                    }}
                />
            )}
            <Card flat withoutPadding className='fees-warning mt-4'>
                <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} data-tooltip-place='left' className='me-2'>
                    <img src={Assets.images.info} alt='info' />
                    <Tooltip id='fees-tooltip' delay={2000} />
                </span>
                {I18n.t('deposit.feesWarning')}
            </Card>
            <Button
                type='button'
                onClick={async () => {
                    await onDeposit(poolToDeposit, depositAmount);
                }}
                disabled={disabled || !!error || isLoading}
                className='deposit-cta w-100 position-relative mt-4'
            >
                <div className='position-absolute deposit-cta-bg w-100 h-100' />
                <img src={Assets.images.yellowStar} alt='Star' className='star me-3 no-filter' style={{ zIndex: 0 }} />
                <div className='deposit-cta-text'>{I18n.t('deposit.saveAndWinBtn')}</div>
                <img src={Assets.images.yellowStar} alt='Star' className='star ms-3 no-filter' style={{ zIndex: 0 }} />
            </Button>
        </div>
    );
};

const DepositStep3 = ({ txInfos, price, title, subtitle, onTwitterShare }: { txInfos: TxInfos; title: string; subtitle: string; price: number; onTwitterShare: () => void }) => {
    const navigate = useNavigate();

    return (
        <div className='step-3'>
            <div className='d-flex flex-column flex-lg-row justify-content-between align-items-center mt-2 mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title text-center text-lg-start' dangerouslySetInnerHTML={{ __html: title }} />
                <div className='card-step-subtitle text-center text-lg-start mt-4 mt-lg-0' dangerouslySetInnerHTML={{ __html: subtitle }} />
            </div>
            <div className='d-flex flex-column mt-5'>
                <div className='deposit-card d-flex flex-column flex-sm-row justify-content-between align-items-sm-center py-3 py-sm-4 px-4 px-sm-5 mb-4'>
                    <div className='d-flex flex-row align-items-center'>
                        <img className='denom-icon no-filter' src={DenomsUtils.getIconFromDenom(txInfos.denom.toLowerCase())} alt={txInfos.denom} />
                        <div className='d-flex flex-column ms-3'>
                            <div className='deposit-amount text-start'>
                                {txInfos.amount} {DenomsUtils.getNormalDenom(txInfos.denom).toUpperCase()}
                            </div>
                            <small className='deposit-infos text-start'>
                                {numeral(txInfos.amount).multiply(price).format('$0,0[.]00')} - {I18n.t('pools.poolId', { poolId: txInfos.poolId })}
                            </small>
                        </div>
                    </div>
                    <div className='deposit-state rounded-pill text-nowrap success mt-3 mt-sm-0'>{I18n.t('mySavings.depositStates', { returnObjects: true })[DepositState.DEPOSIT_STATE_SUCCESS]}</div>
                </div>
                <div className='row row-cols-1 row-cols-lg-3 gx-4 gy-4 ctas-section'>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center flex-grow-1 text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${txInfos.hash}`, '_blank');
                            }}
                        >
                            <img src={Assets.images.lumLogoPurple} alt='Lum Network logo purple' className='me-4' />
                            {I18n.t('deposit.seeOnExplorer')}
                        </Card>
                    </div>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.MINTSCAN}/lum/txs/${txInfos.hash}`, '_blank');
                            }}
                        >
                            <img src={Assets.images.mintscanPurple} alt='Mintscan' className='me-4' />
                            {I18n.t('deposit.seeOnMintscan')}
                        </Card>
                    </div>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center text-start p-4 w-100'
                            onClick={() => {
                                navigate(NavigationConstants.MY_SAVINGS);
                            }}
                        >
                            <img src={Assets.images.mySavings} alt='My savings' className='me-3' />
                            {I18n.t('deposit.goToMySavings')}
                        </Card>
                    </div>
                </div>
                <Button
                    className='deposit-cta align-self-center position-relative mt-5 mb-2'
                    onClick={() => {
                        window.open(
                            `${NavigationConstants.TWEET_URL}?text=${encodeURI(
                                I18n.t('deposit.shareTwitterContent', txInfos ? { amount: txInfos.amount, denom: txInfos.denom, tvl: txInfos.tvl + ' ' + txInfos.denom } : {}),
                            ).replaceAll('#', '%23')}`,
                            '_blank',
                        );
                        onTwitterShare();
                    }}
                >
                    <div className='position-absolute deposit-cta-bg w-100 h-100' />
                    <img src={Assets.images.twitterWhite} alt='Twitter' className='d-none d-sm-block me-3 twitter-icon' width={25} style={{ zIndex: 0 }} />
                    <div className='deposit-cta-text'>{I18n.t('deposit.shareTwitter')}</div>
                </Button>
            </div>
        </div>
    );
};

const DepositSteps = (props: Props) => {
    const { currentStep, steps, otherWallets, price, pools, currentPool, amountFromLocationState, onNextStep, onDeposit, onFinishDeposit, onTwitterShare, transferForm, lumWallet } = props;
    const [amount, setAmount] = useState('');
    const [txInfos, setTxInfos] = useState<TxInfos | null>(null);
    const [otherWallet, setOtherWallet] = useState<OtherWalletModel | undefined>(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
    const [nonEmptyWallets, setNonEmptyWallets] = useState(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));
    const [initialAmount, setInitialAmount] = useState(amountFromLocationState ? amountFromLocationState.toFixed() : '0');

    useEffect(() => {
        setOtherWallet(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
        setNonEmptyWallets(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));
    }, [otherWallets, currentPool]);

    useEffect(() => {
        if (!amountFromLocationState) {
            const existsInLumBalances = lumWallet?.balances?.find((balance) => balance.denom === currentPool.nativeDenom);
            setInitialAmount(existsInLumBalances && currentPool.nativeDenom !== LumConstants.MicroLumDenom ? existsInLumBalances.amount : '0');
        }
    }, [lumWallet]);

    return (
        <div className='deposit-steps h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
            <div className='card-content'>
                {currentStep === 0 && currentPool.nativeDenom !== LumConstants.MicroLumDenom && (
                    <DepositStep1
                        title={steps[currentStep].cardTitle ?? steps[currentStep].title ?? ''}
                        subtitle={steps[currentStep].cardSubtitle ?? steps[currentStep].subtitle ?? ''}
                        currentPool={currentPool}
                        form={transferForm}
                        onTransfer={(amount) => setAmount(amount)}
                        price={price}
                        pools={pools}
                        disabled={!otherWallet}
                        balances={(currentPool.nativeDenom === LumConstants.MicroLumDenom ? lumWallet?.balances : otherWallet?.balances) || []}
                        nonEmptyWallets={nonEmptyWallets}
                    />
                )}
                {((currentStep === 1 && currentPool.nativeDenom !== LumConstants.MicroLumDenom) || (currentStep === 0 && currentPool.nativeDenom === LumConstants.MicroLumDenom)) && (
                    <DepositStep2
                        title={steps[currentStep].cardTitle ?? steps[currentStep]?.title ?? ''}
                        subtitle={steps[currentStep].cardSubtitle ?? steps[currentStep].subtitle ?? ''}
                        balances={lumWallet?.balances || []}
                        initialAmount={initialAmount}
                        amount={amount}
                        disabled={!lumWallet}
                        onDeposit={async (poolToDeposit, depositAmount) => {
                            if (onDeposit) {
                                const res = await onDeposit(poolToDeposit, depositAmount);

                                if (res && !res.error) {
                                    onFinishDeposit(onNextStep);
                                    setTxInfos({
                                        hash: LumUtils.toHex(res.hash).toUpperCase(),
                                        amount: numeral(depositAmount).format('0,0[.]00'),
                                        denom: DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase(),
                                        tvl: numeral(NumbersUtils.convertUnitNumber(poolToDeposit.tvlAmount) + Number(depositAmount)).format('0,0'),
                                        poolId: poolToDeposit.poolId.toString(),
                                    });
                                }
                            }
                        }}
                        currentPool={currentPool}
                        pools={pools}
                        price={price}
                    />
                )}
                {currentStep === steps.length && txInfos && (
                    <DepositStep3 title={I18n.t('deposit.shareStep.title')} subtitle={I18n.t('deposit.shareStep.subtitle')} txInfos={txInfos} price={price} onTwitterShare={onTwitterShare} />
                )}
            </div>
        </div>
    );
};

export default DepositSteps;
