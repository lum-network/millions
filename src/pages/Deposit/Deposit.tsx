import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useParams, unstable_useBlocker as useBlocker, useBeforeUnload } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LumConstants } from '@lum-network/sdk-javascript';

import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';

import { Card, Lottie, Modal, Steps } from 'components';
import { NavigationConstants } from 'constant';
import { useVisibilityState } from 'hooks';
import { DenomsUtils, I18n } from 'utils';
import { RootState, Dispatch } from 'redux/store';

import DepositSteps from './components/DepositSteps/DepositSteps';
import QuitDepositModal from './components/Modals/QuitDeposit/QuitDeposit';
import IbcTransferModal from './components/Modals/IbcTransfer/IbcTransfer';
import Error404 from '../404/404';
import { confettis } from 'utils/confetti';

import './Deposit.scss';

const Deposit = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();

    const { otherWallets, lumWallet, prices, pools, pool, isTransferring } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
        pools: state.pools.pools,
        pool: poolId ? state.pools.pools.find((pool) => pool.poolId.toString() === poolId) : state.pools.pools.find((pool) => pool.nativeDenom === 'u' + denom),
        isTransferring: state.loading.effects.wallet.ibcTransfer,
    }));

    const existsInLumBalances = lumWallet?.balances?.find((balance) => DenomsUtils.getNormalDenom(balance.denom) === denom);
    const [currentStep, setCurrentStep] = useState(existsInLumBalances && denom !== LumConstants.LumDenom ? 1 : 0);
    const [shareState, setShareState] = useState<('sharing' | 'shared') | null>(null);
    const [ibcModalPrevAmount, setIbcModalPrevAmount] = useState<string>('');
    const [ibcModalDepositAmount, setIbcModalDepositAmount] = useState<string>('');
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
                const res = await dispatch.wallet.ibcTransfer({
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

                if (res && !res.error) {
                    setCurrentStep(currentStep + 1);
                }
            }
        },
    });

    const blocker = useBlocker(transferForm.dirty && currentStep < 2);
    const visibilityState = useVisibilityState();

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

    useEffect(() => {
        if (visibilityState === 'visible' && shareState === 'sharing') {
            setShareState('shared');
        }
    }, [visibilityState, shareState]);

    if (pool === undefined) {
        return <Error404 />;
    }

    const steps = I18n.t('deposit.steps', {
        returnObjects: true,
        denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase(),
        chainName: pool.internalInfos?.chainName || 'Native Chain',
    });

    const otherWallet = otherWallets[denom || ''];

    if (!denom || !lumWallet || (denom !== 'lum' && !otherWallet)) {
        return <Navigate to={NavigationConstants.HOME} />;
    }

    if (denom === LumConstants.LumDenom) {
        steps.splice(0, 1);
    }

    const isLastStep = currentStep === steps.length - 1;

    if (isLastStep) {
        confettis(10000);
    }

    return (
        <>
            <div className={`row row-cols-1 ${!isLastStep && 'row-cols-lg-2'} py-5 h-100 gy-5 justify-content-center`}>
                {!isLastStep && (
                    <div className='col'>
                        <h1 className='steps-title'>{I18n.t('deposit.title')}</h1>
                        <Steps currentStep={currentStep} steps={steps} lastStepChecked={shareState === 'shared'} />
                    </div>
                )}
                <div className='col'>
                    <Card withoutPadding className={`d-flex flex-column justify-content-between px-3 px-sm-5 py-3 ${isLastStep ? 'last-step glow-bg' : ''}`}>
                        <DepositSteps
                            transferForm={transferForm}
                            onNextStep={() => setCurrentStep(currentStep + 1)}
                            onPrevStep={(prev, next) => {
                                transferForm.setFieldValue('amount', next);
                                setIbcModalPrevAmount(prev);
                                setIbcModalDepositAmount(next);
                                if (ibcModalRef.current) {
                                    ibcModalRef.current.show();
                                }
                            }}
                            onTwitterShare={() => setShareState('sharing')}
                            currentStep={currentStep}
                            steps={steps}
                            pools={pools.filter((pool) => pool.nativeDenom === 'u' + denom)}
                            currentPool={pool}
                            price={prices?.[denom || ''] || 0}
                            lumWallet={lumWallet}
                            otherWallets={otherWallets}
                        />
                        {isLastStep && (
                            <Lottie
                                className='cosmonaut-rocket position-absolute start-0 top-100 translate-middle'
                                animationData={cosmonautWithRocket}
                                segments={[
                                    [0, 30],
                                    [30, 128],
                                ]}
                            />
                        )}
                    </Card>
                </div>
            </div>
            <QuitDepositModal modalRef={quitModalRef} blocker={blocker} />
            <IbcTransferModal
                modalRef={ibcModalRef}
                denom={denom}
                prevAmount={ibcModalPrevAmount}
                nextAmount={ibcModalDepositAmount}
                isLoading={isTransferring}
                price={prices[denom]}
                onConfirm={async () => {
                    const amount = transferForm.values.amount.toString();

                    const res = await dispatch.wallet.ibcTransfer({
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

                    if (res && !res.error) {
                        if (ibcModalRef.current) {
                            ibcModalRef.current.hide();
                        }
                    }
                }}
            />
        </>
    );
};

export default Deposit;
