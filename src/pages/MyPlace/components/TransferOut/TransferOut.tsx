import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import Skeleton from 'react-loading-skeleton';
import { FormikProps } from 'formik';

import Assets from 'assets';
import { AmountInput, AssetsSelect, Button, Card, Steps } from 'components';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { LumTypes } from '@lum-network/sdk-javascript';

const TransferOut = ({
    form,
    isLoading,
    balances,
    prices,
}: {
    form: FormikProps<{
        withdrawAddress: string;
        denom: string;
        amount: string;
    }>;
    isLoading: boolean;
    balances: LumTypes.Coin[];
    prices: { [key: string]: number };
}) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = I18n.t('myPlace.transferOutModal.steps', {
        returnObjects: true,
    });

    return (
        <div className='row row-cols-1 row-cols-lg-2 h-100 gy-5'>
            <div className='col text-start'>
                <h1 className='steps-title'>{I18n.t('myPlace.transferOutModal.title')}</h1>
                <Steps currentStep={currentStep} steps={steps} stepBackgroundColor='white' />
            </div>
            <div className='col d-flex'>
                <Card withoutPadding className='d-flex flex-column justify-content-between px-5 py-3 flex-grow-1 glow-bg'>
                    <div className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
                        <div className='mb-5 mb-lg-0'>
                            <div className='card-step-title'>{steps[currentStep].cardTitle || steps[currentStep].title}</div>
                            <div className='card-step-subtitle'>{steps[currentStep].cardSubtitle || steps[currentStep].subtitle}</div>
                        </div>
                        <form onSubmit={form.handleSubmit} className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
                            <div className='w-100 mt-5'>
                                <AmountInput
                                    isLoading={isLoading}
                                    className='amount-input'
                                    label={I18n.t('myPlace.transferOutModal.amountInput.label')}
                                    sublabel={I18n.t('myPlace.transferOutModal.amountInput.sublabel', {
                                        amount: NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(balances.length > 0 ? balances[0].amount : '0')),
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
                                    error={form.errors.amount}
                                />
                            </div>
                            <div className='mt-5'>
                                <AssetsSelect
                                    isLoading={isLoading}
                                    balances={balances}
                                    value={form.values.denom}
                                    onChange={(value) => {
                                        form.setFieldValue('denom', value);
                                    }}
                                    options={balances.map((balance) => ({
                                        label: DenomsUtils.getNormalDenom(balance.denom),
                                        value: balance.denom,
                                    }))}
                                />
                                {isLoading ? (
                                    <Skeleton height={42} className='mt-4' />
                                ) : (
                                    <Card flat withoutPadding className='fees-warning mt-4'>
                                        <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                            <img src={Assets.images.info} alt='info' />
                                            <Tooltip id='fees-tooltip' className='tooltip-light width-400' variant='light' />
                                        </span>
                                        {I18n.t('deposit.feesWarning')}
                                    </Card>
                                )}
                                <Button type='submit' onClick={() => setCurrentStep(currentStep + 1)} className='w-100 mt-4' disabled={isLoading} loading={isLoading}>
                                    {I18n.t('myPlace.transferOutModal.cta')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TransferOut;
