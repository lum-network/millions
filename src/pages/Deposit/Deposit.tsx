import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useParams, unstable_useBlocker as useBlocker, useBeforeUnload } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Card, Modal, Steps } from 'components';
import { NavigationConstants } from 'constant';
import { DenomsUtils, I18n } from 'utils';
import { RootState, Dispatch } from 'redux/store';

import DepositSteps from './components/DepositSteps/DepositSteps';
import QuitDepositModal from './components/Modals/QuitDeposit/QuitDeposit';
import IbcTransferModal from './components/Modals/IbcTransfer/IbcTransfer';
import Error404 from '../404/404';

import './Deposit.scss';

const Deposit = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();

    const { otherWallets, lumWallet, prices, pools, pool } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
        pools: state.pools.pools,
        pool: poolId ? state.pools.pools.find((pool) => pool.poolId.toString() === poolId) : state.pools.pools.find((pool) => pool.nativeDenom === 'u' + denom),
    }));

    const existsInLumBalances = lumWallet?.balances?.find((balance) => DenomsUtils.getNormalDenom(balance.denom) === denom);
    const [currentStep, setCurrentStep] = useState(existsInLumBalances ? 1 : 0);
    const quitModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const ibcModalRef = useRef<React.ElementRef<typeof Modal>>(null);
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

            if (pool) {
                const hash = await dispatch.wallet.ibcTransfer({
                    type: 'deposit',
                    fromAddress: otherWallet.address,
                    toAddress: lumWallet?.address || '',
                    amount: {
                        amount,
                        denom: pool.nativeDenom,
                    },
                    normalDenom: DenomsUtils.getNormalDenom(pool.nativeDenom),
                    ibcChannel: pool.transferChannelId,
                    chainId: pool.chainId,
                });

                if (hash) {
                    setCurrentStep(currentStep + 1);
                }
            }
        },
    });

    const blocker = useBlocker(transferForm.dirty && currentStep < 2);

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

    if (pool === undefined) {
        return <Error404 />;
    }

    const steps = I18n.t('deposit.steps', {
        returnObjects: true,
        denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase(),
        chainName: pool.internalInfos?.chainName || 'Native Chain',
    });

    const isLastStep = currentStep === steps.length - 1;

    const otherWallet = otherWallets[denom || ''];

    if (!lumWallet || (denom !== 'lum' && !otherWallet)) {
        return <Navigate to={NavigationConstants.HOME} />;
    }

    return (
        <>
            <div className='row row-cols-1 row-cols-lg-2 py-5 h-100 gy-5'>
                <div className='col'>
                    <h1 className='steps-title'>{I18n.t('deposit.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className='col'>
                    <Card withoutPadding className={`d-flex flex-column justify-content-between px-5 py-3 ${isLastStep ? 'glow-bg' : ''}`}>
                        <DepositSteps
                            transferForm={transferForm}
                            onNextStep={() => setCurrentStep(currentStep + 1)}
                            onPrevStep={(amount) => {
                                transferForm.setFieldValue('amount', amount);
                                if (ibcModalRef.current) {
                                    ibcModalRef.current.toggle();
                                }
                            }}
                            currentStep={currentStep}
                            steps={steps}
                            pools={pools.filter((pool) => pool.nativeDenom === 'u' + denom)}
                            currentPool={pool}
                            price={prices?.[denom || ''] || 0}
                            lumWallet={lumWallet}
                            otherWallets={otherWallets}
                        />
                    </Card>
                </div>
            </div>
            <QuitDepositModal modalRef={quitModalRef} blocker={blocker} />
            <IbcTransferModal
                modalRef={ibcModalRef}
                onConfirm={() => {
                    setCurrentStep(currentStep - 1);
                }}
            />
        </>
    );
};

export default Deposit;
