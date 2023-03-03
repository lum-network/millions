import React, { useCallback, useRef, useState } from 'react';
import { useBeforeUnload, useParams } from 'react-router-dom';
import { Card, Modal } from 'components';
import { DenomsUtils, I18n } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

import Steps from './components/Steps/Steps';
import DepositSteps from './components/DepositSteps/DepositSteps';

import './Deposit.scss';
import { PoolsConstants } from 'constant';

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

    const steps = I18n.t('deposit.steps', {
        returnObjects: true,
        denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase(),
        chainName: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(denom || '')].chainName,
    });
    const isFirstStep = currentStep === 0;
    const otherWallet = otherWallets[denom || ''];

    useBeforeUnload(
        useCallback(() => {
            if (quitModalRef.current) {
                quitModalRef.current.toggle();
            }
        }, []),
    );

    if (!otherWallet || !lumWallet) {
        return null;
    }

    return (
        <>
            <div className='row row-cols-1 row-cols-lg-2 py-5 h-100'>
                <div className='col'>
                    <h1 className='steps-title'>{I18n.t('deposit.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className={`col ${isFirstStep ? 'd-flex' : ''}`}>
                    <Card className={`d-flex flex-column justify-content-between ${isFirstStep ? 'flex-grow-1' : ''}`}>
                        <DepositSteps
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
            <Modal id='quitModal' ref={quitModalRef}>
                Quit Modal
            </Modal>
        </>
    );
};

export default Deposit;
