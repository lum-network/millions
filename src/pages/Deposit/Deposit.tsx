import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useParams, unstable_useBlocker as useBlocker, useBeforeUnload } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import infoIcon from 'assets/images/info.svg';
import { Button, Card, Modal } from 'components';
import { NavigationConstants, PoolsConstants } from 'constant';
import { DenomsUtils, I18n } from 'utils';
import { RootState, Dispatch } from 'redux/store';

import Steps from './components/Steps/Steps';
import DepositSteps from './components/DepositSteps/DepositSteps';
import Error404 from '../404/404';

import './Deposit.scss';

const Deposit = () => {
    const { denom } = useParams<{ denom: string }>();

    const { otherWallets, lumWallet, prices } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
    }));

    const existsInLumBalances = lumWallet?.balances?.find((balance) => DenomsUtils.getNormalDenom(balance.denom) === denom);
    const [currentStep, setCurrentStep] = useState(existsInLumBalances ? 1 : 0);
    const [initialAmount] = useState(existsInLumBalances ? existsInLumBalances.amount : undefined);
    const quitModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const dispatch = useDispatch<Dispatch>();

    const transferForm = useFormik({
        initialValues: {
            amount: '',
        },
        validationSchema: yup.object().shape({
            amount: yup.string().required(I18n.t('errors.generic.required', { field: 'Amount' })),
        }),
        onSubmit: async (values) => {
            const amount = values.amount.toString();
            const hash = await dispatch.wallet.ibcTransfer({
                type: 'deposit',
                fromAddress: otherWallet.address,
                toAddress: lumWallet?.address || '',
                amount: {
                    amount,
                    denom: 'u' + denom,
                },
                normalDenom: PoolsConstants.POOLS[denom || ''].denom,
                ibcChannel: PoolsConstants.POOLS[denom || ''].ibcDestChannel,
                chainId: PoolsConstants.POOLS[denom || ''].chainId,
            });

            if (hash) {
                setCurrentStep(currentStep + 1);
            }
        },
    });

    const blocker = useBlocker(transferForm.dirty);

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (!transferForm.dirty) {
                blocker.reset();
            } else {
                if (quitModalRef.current) {
                    quitModalRef.current.toggle();
                }
            }
        }
    }, [blocker, transferForm]);

    useBeforeUnload(
        useCallback(
            (event) => {
                if (transferForm.dirty) {
                    event.preventDefault();

                    return (event.returnValue = '');
                }
            },
            [transferForm],
        ),
        { capture: true },
    );

    if (PoolsConstants.POOLS[denom || ''] === undefined) {
        return <Error404 />;
    }

    const steps = I18n.t('deposit.steps', {
        returnObjects: true,
        denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase(),
        chainName: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(denom || '')].chainName,
    });

    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const otherWallet = otherWallets[denom || ''];

    if (!otherWallet || !lumWallet) {
        return <Navigate to={NavigationConstants.HOME} />;
    }

    return (
        <>
            <div className='row row-cols-1 row-cols-lg-2 py-5 h-100 gy-5'>
                <div className='col'>
                    <h1 className='steps-title'>{I18n.t('deposit.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className={`col ${isFirstStep ? 'd-flex' : ''}`}>
                    <Card withoutPadding className={`d-flex flex-column justify-content-between px-5 py-3 ${isFirstStep ? 'flex-grow-1' : ''} ${isLastStep ? 'glow-bg' : ''}`}>
                        <DepositSteps
                            transferForm={transferForm}
                            onNextStep={() => setCurrentStep(currentStep + 1)}
                            currentStep={currentStep}
                            steps={steps}
                            denom={denom || ''}
                            price={prices?.[denom || ''] || 0}
                            lumWallet={lumWallet}
                            initialAmount={initialAmount}
                            otherWallets={otherWallets}
                        />
                    </Card>
                </div>
            </div>

            <Modal id='quitModal' ref={quitModalRef} withCloseButton={false} dataBsBackdrop='static' bodyClassName='d-flex flex-column align-items-center'>
                <img src={infoIcon} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('deposit.quitModal.title')}</h3>
                <div className='d-flex flex-row align-self-stretch justify-content-between'>
                    <Button
                        outline
                        className='w-100'
                        onClick={() => {
                            if (quitModalRef.current) {
                                quitModalRef.current.hide();
                            }
                            blocker.proceed?.();
                        }}
                    >
                        {I18n.t('common.continue')}
                    </Button>
                    <Button
                        className='w-100 ms-4'
                        onClick={() => {
                            if (quitModalRef.current) {
                                quitModalRef.current.hide();
                            }
                            blocker.reset?.();
                        }}
                    >
                        {I18n.t('common.cancel')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default Deposit;
