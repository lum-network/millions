import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import { FormikProps } from 'formik';
import numeral from 'numeral';
import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

import Assets from 'assets';
import { AmountInput, Button, Card, SmallerDecimal, Tooltip } from 'components';
import { NavigationConstants } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel } from 'models';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { RootState } from 'redux/store';

import CsvFileInput from '../CsvFileInput/CsvFileInput';

import './DepositDropSteps.scss';
import DepositIbcTransfer from 'components/DepositIbcTransfer/DepositIbcTransfer';

interface StepProps {
    currentPool: PoolModel;
    balances: LumTypes.Coin[];
    price: number;
    pools: PoolModel[];
    title: string;
    subtitle?: string;
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
    onPrevStep: (prevAmount: string, nextAmount: string) => void;
    onDepositDrop: (pool: PoolModel, deposits: { amount: string; winnerAddress: string }[], onDepositCallback: (batchNum: number) => void) => Promise<true | null>;
    onFinishDeposit: (callback: () => void) => void;
    onTwitterShare: () => void;
    lumWallet: LumWalletModel | null;
    transferForm: FormikProps<{ amount: string }>;
    price: number;
    isDepositDrop?: boolean;
}

type TxInfos = {
    depositorAddress: string;
    amount: string;
    denom: string;
    tvl: string;
    poolId: string;
    numOfWallets: number;
};

const DepositDropStep = (
    props: StepProps & {
        amount: string;
        onDepositDrop: (pool: PoolModel, deposits: { amount: string; winnerAddress: string }[], onDepositCallback: (batchNum: number) => void) => Promise<true | null>;
        initialAmount?: string;
        onPrevStep: (prevAmount: string, nextAmount: string) => void;
    },
) => {
    const { currentPool, price, balances, amount, initialAmount, title, onDepositDrop } = props;

    const [depositAmount, setDepositAmount] = useState<string>(
        initialAmount ? (NumbersUtils.convertUnitNumber(initialAmount) - (currentPool.nativeDenom === LumConstants.MicroLumDenom ? 0.005 : 0)).toFixed(6) : amount,
    );
    const [depositDrops, setDepositDrops] = useState<
        {
            winnerAddress: string;
            amount: string;
        }[]
    >([]);

    const [inputType, setInputType] = useState<'csv' | 'manual'>('csv');
    const [manualInputs, setManualInputs] = useState<
        {
            winnerAddress: string;
            amount: string;
            errors: Record<string, string>;
        }[]
    >([]);
    const [batch, setBatch] = useState(1);
    const [batchTotal, setBatchTotal] = useState(0);
    const [isModifying, setIsModifying] = useState(currentPool.nativeDenom === LumConstants.MicroLumDenom);
    const [totalAmountError, setTotalAmountError] = useState('');
    const [csvError, setCsvError] = useState('');

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.depositDrop);

    const validateInput = (value: string) => {
        const depositAmountNumber = Number(value);

        if (Number.isNaN(depositAmountNumber)) {
            setTotalAmountError(I18n.t('errors.generic.invalid', { field: 'deposit amount' }));
        } else {
            setTotalAmountError('');
        }
    };

    const validateInputs = (inputs: { amount: string; winnerAddress: string; errors: Record<string, string> }[]) => {
        let isValid = true;

        for (const input of inputs) {
            const amountToNumber = Number(input.amount);
            const minDeposit = NumbersUtils.convertUnitNumber(currentPool.minDepositAmount);

            if (Object.keys(input.errors).length > 0 || !LumUtils.isAddressValid(input.winnerAddress) || Number.isNaN(amountToNumber) || amountToNumber < minDeposit) {
                isValid = false;
            }
        }

        return isValid;
    };

    const onInvalidCsv = useCallback((error: string) => {
        setCsvError(error);
    }, []);

    const onValidCsv = useCallback((depositDrops: { amount: string; winnerAddress: string }[]) => {
        setDepositDrops([...depositDrops]);
        setCsvError('');
    }, []);

    const onAddressInputChange = (text: string, index: number) => {
        const newInputs = [...manualInputs];
        const input = newInputs[index];

        if (!input) {
            return;
        }

        input.winnerAddress = text;

        if (!LumUtils.isAddressValid(text)) {
            input.errors = {
                winnerAddress: I18n.t('errors.generic.invalid', { field: 'lum address' }),
            };
        } else {
            delete input.errors.winnerAddress;
        }

        setManualInputs([...newInputs]);
    };

    const onAmountInputChange = (text: string, index: number) => {
        const newInputs = [...manualInputs];
        const input = newInputs[index];

        if (!input) {
            return;
        }

        input.amount = text;

        const amountToNumber = Number(text);
        const cumulatedAmount = newInputs.reduce((acc, input, i) => (index === i ? 0 : Number(input.amount)) + acc, 0);
        const maxAmount = NumbersUtils.convertUnitNumber(balances.find((bal) => bal.denom === currentPool.nativeDenom)?.amount || '0');
        const minDeposit = NumbersUtils.convertUnitNumber(currentPool.minDepositAmount);

        if (Number.isNaN(amountToNumber)) {
            input.errors = {
                amount: I18n.t('errors.generic.invalid', { field: 'amount' }),
            };
        } else if (amountToNumber < minDeposit) {
            input.errors = {
                amount: I18n.t('errors.deposit.lessThanMinDeposit', { minDeposit, denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase() }),
            };
        } else if (!Number.isNaN(maxAmount) && amountToNumber > maxAmount) {
            input.errors = {
                amount: I18n.t('errors.deposit.greaterThanBalance'),
            };
        } else {
            delete input.errors.amount;
        }

        if (!Number.isNaN(maxAmount) && amountToNumber + cumulatedAmount > maxAmount) {
            setTotalAmountError(I18n.t('depositDrops.depositFlow.manualInputsErrors.greaterThanAvailable'));
        } else {
            setTotalAmountError('');
        }

        setManualInputs([...newInputs]);
    };

    useEffect(() => {
        if (initialAmount) {
            setDepositAmount((NumbersUtils.convertUnitNumber(initialAmount) - (currentPool.nativeDenom === LumConstants.MicroLumDenom ? 0.005 : 0)).toFixed(6));
        }
    }, [initialAmount]);
    return (
        <div className='step-2'>
            <div className='d-flex flex-column mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title' dangerouslySetInnerHTML={{ __html: title }} />
            </div>
            <div className='input-type-container d-flex flex-row justify-content-center my-4'>
                <div className='d-flex flex-row'>
                    <button className={`deposit-drop-input-type ${inputType === 'csv' ? 'active' : ''}`} disabled={inputType === 'csv'} onClick={() => setInputType('csv')}>
                        {I18n.t('depositDrops.depositFlow.csv')}
                    </button>
                    <button
                        className={`deposit-drop-input-type ${inputType === 'manual' ? 'active' : ''}`}
                        disabled={inputType === 'manual'}
                        onClick={() => {
                            setInputType('manual');
                            setManualInputs([
                                {
                                    winnerAddress: '',
                                    amount: '',
                                    errors: {},
                                },
                            ]);
                        }}
                    >
                        {I18n.t('depositDrops.depositFlow.manual')}
                    </button>
                </div>
            </div>
            {inputType === 'csv' ? (
                <>
                    <CsvFileInput onValidCsv={onValidCsv} onInvalidCsv={onInvalidCsv} minDepositAmount={NumbersUtils.convertUnitNumber(currentPool.minDepositAmount)} />
                    <div className='download-btn-container'>
                        <a href={'/deposit_drop_template.csv'} target='_blank' className='download-csv-btn app-btn app-btn-outline w-100 mt-4' rel='noreferrer'>
                            <span>
                                <img src={Assets.images.download} className='me-3' />
                                {I18n.t('depositDrops.depositFlow.downloadTemplate')}
                            </span>
                        </a>
                    </div>
                </>
            ) : (
                <>
                    {manualInputs.map((input, index) => {
                        return (
                            <Card withoutPadding key={`deposit-drop-winner-${index + 1}`} flat className='deposit-drop-winner-card d-flex flex-column align-items-stretch p-4'>
                                <div className='d-flex flex-column'>
                                    <label className='text-start mb-2'>{I18n.t('depositDrops.depositFlow.winnerAddress')}</label>
                                    <input
                                        className={`deposit-drop-address-input ${input.errors.winnerAddress && 'error'}`}
                                        spellCheck={false}
                                        value={manualInputs[index].winnerAddress || ''}
                                        onChange={(event) => onAddressInputChange(event.target.value, index)}
                                    />
                                    {input.errors.winnerAddress ? <p className='error-message mb-0 mt-2 text-start'>{input.errors.winnerAddress}</p> : null}
                                </div>
                                <div className={`input-container d-flex flex-column mt-5 ${input.errors.amount && 'error'}`}>
                                    <label className='text-start mb-2'>{I18n.t('depositDrops.depositFlow.amount')}</label>
                                    <input
                                        className={`deposit-drop-amount-input ${input.errors.amount && 'error'}`}
                                        type='number'
                                        step='any'
                                        min='0'
                                        max={balances.length > 0 ? NumbersUtils.convertUnitNumber(balances.find((bal) => bal.denom === currentPool.nativeDenom)?.amount || '0') : '0'}
                                        value={manualInputs[index].amount || ''}
                                        onChange={(event) => onAmountInputChange(event.target.value, index)}
                                    />
                                    {input.errors.amount ? <p className='error-message mb-0 mt-2 text-start'>{input.errors.amount}</p> : null}
                                </div>
                                <Button
                                    outline
                                    className='mt-5'
                                    onClick={() => {
                                        manualInputs.splice(index, 1);

                                        setManualInputs([...manualInputs]);
                                    }}
                                >
                                    <span className='me-2'>
                                        <img src={Assets.images.remove} alt='remove' />
                                    </span>
                                    {I18n.t('depositDrops.depositFlow.removeWinner')}
                                </Button>
                            </Card>
                        );
                    })}
                    {manualInputs.length < 5 && (
                        <Button
                            outline
                            className='mt-4 w-100'
                            onClick={() => {
                                const newInputs = [
                                    ...manualInputs,
                                    {
                                        winnerAddress: '',
                                        amount: '',
                                        errors: {},
                                    },
                                ];

                                setManualInputs([...newInputs]);
                            }}
                        >
                            <span className='me-2'>
                                <img src={Assets.images.add} alt='add' />
                            </span>
                            {I18n.t('depositDrops.depositFlow.addWinner')}
                        </Button>
                    )}
                </>
            )}
            <div className='step2-input-container'>
                <div className='d-flex flex-row justify-content-between align-items-baseline mt-4'>
                    <label className='label text-start'>{I18n.t('depositDrops.depositFlow.depositLabel', { denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase() })}</label>
                    {!isModifying ? (
                        <Button textOnly onClick={() => setIsModifying(true)}>
                            {I18n.t('common.edit')}
                        </Button>
                    ) : (
                        <label className='sublabel'>
                            {I18n.t('withdraw.amountInput.sublabel', {
                                amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.find((b) => b.denom === currentPool.nativeDenom)?.amount || '0')),
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
                            const amount = WalletUtils.getMaxAmount(currentPool.nativeDenom, balances, currentPool.nativeDenom === LumConstants.MicroLumDenom ? 1 : 0);
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
                        }}
                        price={price}
                    />
                ) : (
                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3 last-step-card mt-2'>
                        <div className='asset-info d-flex flex-row'>
                            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(currentPool.nativeDenom))} className='me-3' alt='denom' />
                            <span className='d-none d-sm-block'>{DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase()}</span>
                        </div>
                        <div className='deposit-amount'>{isLoading ? <Skeleton width={20} /> : <SmallerDecimal nb={NumbersUtils.formatTo6digit(depositAmount)} />}</div>
                    </Card>
                )}
                {totalAmountError ? <p className='error-message mb-0 mt-2 text-start'>{totalAmountError}</p> : null}
            </div>
            <Card flat withoutPadding className='fees-warning mt-4'>
                <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                    <img src={Assets.images.info} alt='info' />
                    <Tooltip id='fees-tooltip' delay={2000} />
                </span>
                {I18n.t('deposit.feesWarning')}
            </Card>
            {batchTotal > 1 && (
                <Card flat withoutPadding className='d-flex flex-row justify-content-center batch-card mt-4'>
                    <div className='batch-progress' style={{ width: `calc(${(batch / batchTotal) * 100}% + 4px)` }} />
                    <span data-tooltip-id='batch-tooltip' data-tooltip-html={I18n.t('depositDrops.depositFlow.batchTooltip')} className='me-2'>
                        <img className='batch-card-info-icon' src={Assets.images.info} alt='info' />
                        <Tooltip id='batch-tooltip' delay={2000} />
                    </span>
                    <div style={{ zIndex: 2 }}>{I18n.t('depositDrops.depositFlow.batch', { count: batch, total: batchTotal })}</div>
                </Card>
            )}
            <Button
                type='button'
                onClick={async () => {
                    const drops = [
                        ...(inputType === 'csv'
                            ? depositDrops
                            : manualInputs.map((input) => ({
                                  amount: LumUtils.convertUnit({ amount: input.amount, denom: LumConstants.LumDenom }, LumConstants.MicroLumDenom),
                                  winnerAddress: input.winnerAddress,
                              }))),
                    ];

                    setBatchTotal(Math.ceil(drops.length / 6));

                    const res = await onDepositDrop(currentPool, drops, (index) => setBatch(index));

                    if (!res) {
                        setBatch(1);
                        setBatchTotal(0);
                    }
                }}
                disabled={
                    (inputType === 'csv' && (!!csvError || depositDrops.length === 0)) ||
                    (inputType === 'manual' && (manualInputs.length === 0 || !validateInputs(manualInputs))) ||
                    !!totalAmountError ||
                    isLoading
                }
                className='deposit-cta w-100 position-relative mt-4'
            >
                <div className='position-absolute deposit-cta-bg w-100 h-100' style={{ backgroundColor: '#5634DE', borderRadius: 12 }} />
                <img src={Assets.images.yellowStar} alt='Star' className='star me-3' style={{ zIndex: 0 }} />
                <div className='deposit-cta-text'>{I18n.t('depositDrops.depositFlow.cta')}</div>
                <img src={Assets.images.yellowStar} alt='Star' className='star ms-3' style={{ zIndex: 0 }} />
            </Button>
        </div>
    );
};

const ShareStep = ({ txInfos, price, title, subtitle, onTwitterShare }: { txInfos: TxInfos; title: string; subtitle: string; price: number; onTwitterShare: () => void }) => {
    const navigate = useNavigate();

    return (
        <div className='step-3'>
            <div className='d-flex flex-column flex-lg-row justify-content-between align-items-center mt-2 mb-3 mb-sm-5 mb-lg-0'>
                <div className='card-step-title text-nowrap text-center text-lg-start' dangerouslySetInnerHTML={{ __html: title }} />
                <div className='card-step-subtitle text-nowrap text-center text-lg-start mt-4 mt-lg-0' dangerouslySetInnerHTML={{ __html: subtitle }} />
            </div>
            <div className='d-flex flex-column mt-5'>
                <div className='deposit-card d-flex flex-row justify-content-between align-items-center py-4 px-5 mb-4'>
                    <div className='d-flex flex-row align-items-center'>
                        <img height={50} width={50} src={DenomsUtils.getIconFromDenom(txInfos.denom.toLowerCase())} alt={txInfos.denom} />
                        <div className='d-flex flex-column ms-3'>
                            <div className='deposit-amount text-start'>
                                {txInfos.amount} {DenomsUtils.getNormalDenom(txInfos.denom).toUpperCase()}
                            </div>
                            <small className='deposit-infos text-start'>
                                {numeral(txInfos.amount).multiply(price).format('$0,0[.]00')} - {I18n.t('pools.poolId', { poolId: txInfos.poolId })}
                            </small>
                        </div>
                    </div>
                    <div className='deposit-state rounded-pill text-nowrap success'>{I18n.t('mySavings.depositStates', { returnObjects: true })[DepositState.DEPOSIT_STATE_SUCCESS]}</div>
                </div>
                <div className='row row-cols-1 row-cols-lg-3 gx-4 gy-4 ctas-section'>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center flex-grow-1 text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.LUM_EXPLORER}/account/${txInfos.depositorAddress}`, '_blank');
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
                                window.open(`${NavigationConstants.MINTSCAN}/lum/account/${txInfos.depositorAddress}`, '_blank');
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
                            )}`,
                            '_blank',
                        );
                        onTwitterShare();
                    }}
                >
                    <div className='position-absolute deposit-cta-bg w-100 h-100' style={{ backgroundColor: '#5634DE', borderRadius: 12 }} />
                    <img src={Assets.images.twitterWhite} alt='Twitter' className='me-3 twitter-icon' width={25} style={{ zIndex: 0 }} />
                    <div className='deposit-cta-text'>{I18n.t('deposit.shareTwitter')}</div>
                </Button>
            </div>
        </div>
    );
};

const DepositDropSteps = (props: Props) => {
    const { currentStep, steps, otherWallets, price, pools, currentPool, onNextStep, onPrevStep, onDepositDrop, onFinishDeposit, onTwitterShare, transferForm, lumWallet } = props;
    const [amount, setAmount] = useState('');
    const [txInfos, setTxInfos] = useState<TxInfos | null>(null);
    const [otherWallet, setOtherWallet] = useState<OtherWalletModel | undefined>(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
    const [nonEmptyWallets, setNonEmptyWallets] = useState(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));
    const [initialAmount, setInitialAmount] = useState('0');

    useEffect(() => {
        setOtherWallet(otherWallets[DenomsUtils.getNormalDenom(currentPool.nativeDenom)]);
        setNonEmptyWallets(Object.values(otherWallets).filter((otherWallet) => otherWallet.balances.length > 0 && Number(otherWallet.balances[0].amount) > 0));
    }, [otherWallets, currentPool]);

    useEffect(() => {
        const existsInLumBalances = lumWallet?.balances?.find((balance) => balance.denom === currentPool.nativeDenom);
        setInitialAmount(existsInLumBalances && currentPool.nativeDenom !== LumConstants.MicroLumDenom ? existsInLumBalances.amount : '0');
    }, [lumWallet]);

    return (
        <div id='depositDropFlow' className='deposit-steps h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
            <div className='card-content'>
                {currentStep === 0 && currentPool.nativeDenom !== LumConstants.MicroLumDenom && (
                    <DepositIbcTransfer
                        title={steps[currentStep].cardTitle ?? steps[currentStep].title ?? ''}
                        subtitle={steps[currentStep].cardSubtitle ?? steps[currentStep].subtitle ?? ''}
                        currentPool={currentPool}
                        form={transferForm}
                        onTransfer={(amount) => setAmount(amount)}
                        price={price}
                        pools={pools}
                        balances={(currentPool.nativeDenom === LumConstants.MicroLumDenom ? lumWallet?.balances : otherWallet?.balances) || []}
                        nonEmptyWallets={nonEmptyWallets}
                    />
                )}
                {((currentStep === 1 && currentPool.nativeDenom !== LumConstants.MicroLumDenom) || (currentStep === 0 && currentPool.nativeDenom === LumConstants.MicroLumDenom)) && (
                    <DepositDropStep
                        title={steps[currentStep].cardTitle ?? steps[currentStep]?.title ?? ''}
                        balances={lumWallet?.balances || []}
                        initialAmount={initialAmount}
                        amount={amount}
                        onDepositDrop={async (pool, deposits, callback) => {
                            const totalDepositAmount = deposits.reduce((acc, deposit) => acc + Number(deposit.amount), 0);
                            const res = await onDepositDrop(pool, deposits, callback);

                            if (res) {
                                onFinishDeposit(onNextStep);
                                setTxInfos({
                                    amount: numeral(totalDepositAmount).format('0,0[.]00'),
                                    denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase(),
                                    tvl: numeral(NumbersUtils.convertUnitNumber(pool.tvlAmount) + totalDepositAmount).format('0,0'),
                                    poolId: pool.poolId.toString(),
                                    numOfWallets: deposits.length,
                                    depositorAddress: lumWallet?.address || '',
                                });
                            }

                            return res;
                        }}
                        currentPool={currentPool}
                        pools={pools}
                        price={price}
                        onPrevStep={onPrevStep}
                    />
                )}
                {currentStep === steps.length && txInfos && (
                    <ShareStep title={I18n.t('deposit.shareStep.title')} subtitle={I18n.t('deposit.shareStep.subtitle')} txInfos={txInfos} price={price} onTwitterShare={onTwitterShare} />
                )}
            </div>
        </div>
    );
};

export default DepositDropSteps;
