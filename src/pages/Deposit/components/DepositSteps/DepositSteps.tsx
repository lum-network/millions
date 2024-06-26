import React, { useEffect, useState } from 'react';
import { FormikProps } from 'formik';
import numeral from 'numeral';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Coin, MICRO_LUM_DENOM } from '@lum-network/sdk-javascript';
import { DepositState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';

import Assets from 'assets';

import { AmountInput, Button, Card, DepositIbcTransfer, PoolSelect, SmallerDecimal, Tooltip } from 'components';
import { NavigationConstants } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';

import './DepositSteps.scss';

interface StepProps {
    currentPool: PoolModel;
    balances: Coin[];
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
        [denom: string]: OtherWalletModel | undefined;
    };
    onNextStep: () => void;
    onDeposit: (poolToDeposit: PoolModel, depositAmount: string) => Promise<{ hash: string; error: string | null | undefined } | null>;
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

const DepositStep = (
    props: StepProps & {
        amount: string;
        onDeposit: (poolToDeposit: PoolModel, depositAmount: string) => Promise<void>;
        initialAmount?: string;
    },
) => {
    const { pools, currentPool, price, balances, amount, initialAmount, title, subtitle, disabled, onDeposit } = props;

    const navigate = useNavigate();
    const { denom } = useParams<NavigationConstants.PoolsParams>();

    const [depositAmount, setDepositAmount] = useState<string>(initialAmount ? (parseFloat(initialAmount) - (currentPool.nativeDenom === MICRO_LUM_DENOM ? 0.005 : 0)).toFixed(6) : amount);
    const [poolToDeposit, setPoolToDeposit] = useState(currentPool);
    const [isModifying, setIsModifying] = useState(currentPool.nativeDenom === MICRO_LUM_DENOM);
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
            setDepositAmount((parseFloat(initialAmount) - (currentPool.nativeDenom === MICRO_LUM_DENOM ? 0.005 : 0)).toFixed(6));
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
                                amount: NumbersUtils.formatTo6digit(
                                    NumbersUtils.convertUnitNumber(balances.find((b) => b.denom === poolToDeposit.nativeDenom)?.amount || '0', poolToDeposit.nativeDenom),
                                ),
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
                            const amount = WalletUtils.getMaxAmount(poolToDeposit.nativeDenom, balances, poolToDeposit.nativeDenom === MICRO_LUM_DENOM ? 0.05 : poolToDeposit.internalInfos?.fees);
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

const ShareStep = ({ txInfos, price, title, subtitle, onTwitterShare }: { txInfos: TxInfos; title: string; subtitle: string; price: number; onTwitterShare: () => void }) => {
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
                <div className='row row-cols-1 row-cols-lg-2 gx-4 gy-4 ctas-section'>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.MINTSCAN_LUM}/tx/${txInfos.hash}`, '_blank');
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
    const [nonEmptyWallets, setNonEmptyWallets] = useState<OtherWalletModel[]>(
        Object.values(otherWallets).filter((otherWallet): otherWallet is OtherWalletModel => !!(otherWallet && otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0)),
    );
    const [initialAmount, setInitialAmount] = useState(amountFromLocationState ? amountFromLocationState.toFixed() : '0');

    useEffect(() => {
        setOtherWallet(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
        setNonEmptyWallets(
            Object.values(otherWallets).filter((otherWallet): otherWallet is OtherWalletModel => !!(otherWallet && otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0)),
        );
    }, [otherWallets, currentPool]);

    useEffect(() => {
        if (!amountFromLocationState) {
            const existsInLumBalances = lumWallet?.balances?.find((balance) => balance.denom === currentPool.nativeDenom);
            setInitialAmount(existsInLumBalances && currentPool.nativeDenom !== MICRO_LUM_DENOM ? NumbersUtils.convertUnitNumber(existsInLumBalances.amount, currentPool.nativeDenom).toFixed(6) : '0');
        }
    }, [lumWallet]);

    return (
        <div className='deposit-steps h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
            <div className='card-content'>
                {currentStep === 0 && currentPool.nativeDenom !== MICRO_LUM_DENOM && (
                    <DepositIbcTransfer
                        title={steps[currentStep].cardTitle ?? steps[currentStep].title ?? ''}
                        subtitle={steps[currentStep].cardSubtitle ?? steps[currentStep].subtitle ?? ''}
                        currentPool={currentPool}
                        form={transferForm}
                        onTransfer={(amount) => setAmount(amount)}
                        price={price}
                        pools={pools}
                        disabled={!otherWallet}
                        balances={(currentPool.nativeDenom === MICRO_LUM_DENOM ? lumWallet?.balances : otherWallet?.balances) || []}
                        nonEmptyWallets={nonEmptyWallets}
                    />
                )}
                {((currentStep === 1 && currentPool.nativeDenom !== MICRO_LUM_DENOM) || (currentStep === 0 && currentPool.nativeDenom === MICRO_LUM_DENOM)) && (
                    <DepositStep
                        title={steps[currentStep].cardTitle ?? steps[currentStep]?.title ?? ''}
                        subtitle={steps[currentStep].cardSubtitle ?? steps[currentStep].subtitle ?? ''}
                        balances={lumWallet?.balances || []}
                        initialAmount={initialAmount}
                        amount={amount}
                        disabled={!lumWallet}
                        onDeposit={async (poolToDeposit, depositAmount) => {
                            const res = await onDeposit(poolToDeposit, depositAmount);

                            if (res && !res.error) {
                                onFinishDeposit(onNextStep);
                                setTxInfos({
                                    hash: res.hash.toUpperCase(),
                                    amount: numeral(depositAmount).format('0,0[.]00'),
                                    denom: DenomsUtils.getNormalDenom(poolToDeposit.nativeDenom).toUpperCase(),
                                    tvl: numeral(NumbersUtils.convertUnitNumber(poolToDeposit.tvlAmount, poolToDeposit.nativeDenom) + Number(depositAmount)).format('0,0'),
                                    poolId: poolToDeposit.poolId.toString(),
                                });
                            }
                        }}
                        currentPool={currentPool}
                        pools={pools}
                        price={price}
                    />
                )}
                {currentStep === steps.length && txInfos && (
                    <ShareStep title={I18n.t('deposit.shareStep.title')} subtitle={I18n.t('deposit.shareStep.subtitle')} txInfos={txInfos} price={price} onTwitterShare={onTwitterShare} />
                )}
            </div>
        </div>
    );
};

export default DepositSteps;
