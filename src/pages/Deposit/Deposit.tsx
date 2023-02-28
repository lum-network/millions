import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

import infoIcon from 'assets/images/info.svg';
import { AmountInput, AssetsSelect, Button, Card } from 'components';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

import Steps from './components/Steps/Steps';
import './Deposit.scss';

const Deposit = () => {
    const { denom } = useParams<{ denom: string }>();
    const navigate = useNavigate();

    const { osmosisWallet, lumWallet } = useSelector((state: RootState) => ({
        osmosisWallet: state.wallet.osmosisWallet,
        lumWallet: state.wallet.lumWallet,
    }));

    const depositForm = useFormik({
        initialValues: {
            amount: '',
        },
        validationSchema: yup.object().shape({
            amount: yup.number().required(I18n.t('errors.generic.required', { field: 'Amount' })),
        }),
        onSubmit: (values) => {
            console.log(values);
        },
    });

    const [balances, setBalances] = useState(osmosisWallet?.balances || []);
    const [currentStep, setCurrentStep] = useState(0);

    const steps = I18n.t('deposit.steps', { returnObjects: true, denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase() });
    const isAtLastStep = currentStep + 1 >= steps.length;

    useEffect(() => {
        setBalances(osmosisWallet?.balances || []);
    }, [osmosisWallet]);

    return (
        <div className='row row-cols-1 row-cols-lg-2 py-5 h-100'>
            <div className='col'>
                <h1 className='steps-title'>{I18n.t('deposit.title')}</h1>
                <Steps currentStep={currentStep} steps={steps} />
            </div>
            <div className={`col ${!isAtLastStep ? 'd-flex' : ''}`}>
                <Card className={`d-flex flex-column justify-content-between ${!isAtLastStep ? 'flex-grow-1' : ''}`}>
                    <form onSubmit={depositForm.handleSubmit} className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
                        <div className='mb-5 mb-lg-0'>
                            <div className='card-step-title'>{steps[currentStep].title}</div>
                            <div className='card-step-subtitle'>{steps[currentStep].subtitle}</div>
                        </div>
                        {!isAtLastStep ? (
                            <AmountInput
                                className='amount-input'
                                label={I18n.t('withdraw.amountInput.label')}
                                sublabel={I18n.t('withdraw.amountInput.sublabel', {
                                    amount: NumbersUtils.formatTo6digit(WalletUtils.getMaxAmount('u' + (denom || ''), osmosisWallet?.balances)),
                                    denom,
                                })}
                                onMax={() => {
                                    depositForm.setFieldValue('amount', WalletUtils.getMaxAmount('u' + (denom || ''), osmosisWallet?.balances));
                                }}
                                inputProps={{
                                    type: 'number',
                                    min: 0,
                                    max: WalletUtils.getMaxAmount('u' + (denom || ''), osmosisWallet?.balances),
                                    step: 'any',
                                    ...depositForm.getFieldProps('amount'),
                                }}
                                error={depositForm.errors.amount}
                            />
                        ) : null}
                        <div className='mt-5 mt-lg-0'>
                            {!isAtLastStep ? (
                                <>
                                    <AssetsSelect
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
                                        <>
                                            <div className='winning-chance d-flex flex-row justify-content-between'>
                                                <div>
                                                    {I18n.t('deposit.chancesHint.winning.title')}
                                                    <span data-tooltip-id='winning-chance-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.winning.hint')} className='ms-2'>
                                                        <img src={infoIcon} />
                                                        <Tooltip id='winning-chance-tooltip' className='tooltip-light width-400' variant='light' />
                                                    </span>
                                                </div>
                                                <p className='mb-0'>14%</p>
                                            </div>
                                            <div className='average-prize d-flex flex-row justify-content-between mt-4'>
                                                <div>
                                                    {I18n.t('deposit.chancesHint.averagePrize.title')}
                                                    <span data-tooltip-id='average-prize-tooltip' data-tooltip-html={I18n.t('deposit.chancesHint.averagePrize.hint')} className='ms-2'>
                                                        <img src={infoIcon} />
                                                        <Tooltip id='average-prize-tooltip' className='tooltip-light width-400' variant='light' />
                                                    </span>
                                                </div>
                                                <p className='mb-0'>14 {denom?.toUpperCase()}</p>
                                            </div>
                                        </>
                                    </Card>
                                </>
                            ) : (
                                <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between p-4 mt-5 last-step-card'>
                                    <span className='asset-info'>
                                        <img src={DenomsUtils.getIconFromDenom(denom || '')} className='me-3' />
                                        {(denom || '').toUpperCase()}
                                    </span>
                                    <div className='deposit-amount'>{NumbersUtils.formatTo6digit(Number(depositForm.values.amount))}</div>
                                </Card>
                            )}
                            <Button type={!isAtLastStep ? 'button' : 'submit'} onClick={() => setCurrentStep(currentStep + 1)} className='deposit-cta w-100 mt-4'>
                                {!isAtLastStep ? I18n.t('deposit.depositBtn') : I18n.t('deposit.saveAndWinBtn')}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Deposit;
