import React, { useCallback, useRef, useState } from 'react';
import { useBeforeUnload, useParams /* unstable_usePrompt as usePrompt */ } from 'react-router-dom';
//import { LumClient as LumSdkClient, LumUtils } from '@lum-network/sdk-javascript';
//import { Tendermint34Client } from '@cosmjs/tendermint-rpc';
import { Card, Modal } from 'components';
import { DenomsUtils, I18n } from 'utils';
import { /* useDispatch,  */ useSelector } from 'react-redux';
import { /* Dispatch,  */ RootState } from 'redux/store';

import Steps from './components/Steps/Steps';
import DepositSteps from './components/DepositSteps/DepositSteps';

import './Deposit.scss';

const Deposit = () => {
    const { denom } = useParams<{ denom: string }>();

    const { osmosisWallet, lumWallet, prices } = useSelector((state: RootState) => ({
        osmosisWallet: state.wallet.osmosisWallet,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
    }));

    //const dispatch = useDispatch<Dispatch>();

    const existsInLumBalances = lumWallet?.balances?.find((balance) => DenomsUtils.getNormalDenom(balance.denom) === denom);
    const [currentStep, setCurrentStep] = useState(existsInLumBalances ? 1 : 0);
    const [initialAmount] = useState(existsInLumBalances ? existsInLumBalances.amount : undefined);

    const quitModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const steps = I18n.t('deposit.steps', { returnObjects: true, denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase() });
    const isFirstStep = currentStep === 0;

    useBeforeUnload(
        useCallback(() => {
            if (quitModalRef.current) {
                quitModalRef.current.toggle();
            }
        }, []),
    );

    if (!osmosisWallet || !lumWallet) {
        return null;
    }

    const txTracer = async () => {
        try {
            /* const _client = await LumSdkClient.connect(LumClient.getRpc().replace('https://', 'wss://').replace('http://', 'ws://'));

            const txListener = _client.tmClient.subscribeTx(LumUtils.searchTxByTags([{ key: 'receiver', value: lumWallet.address }]));
            txListener.addListener({
                next: (ev) => {
                    console.log(ev);
                    dispatch.wallet.getLumWalletBalances(lumWallet.address);
                },
                error: (err) => console.error(err),
                complete: () => console.error('complete'),
            }); */
            console.log('start tracking');
        } catch (e) {
            console.log(e);
        }
    };

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
                            traceTx={txTracer}
                            onNextStep={() => setCurrentStep(currentStep + 1)}
                            currentStep={currentStep}
                            steps={steps}
                            denom={denom || ''}
                            price={prices?.[denom || ''] || 0}
                            lumWallet={lumWallet}
                            initialAmount={initialAmount}
                            osmosisWallet={osmosisWallet}
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
