import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Assets from 'assets';
import { Button, Card, Modal, TransactionBatchProgress, SmallerDecimal, Steps, Tooltip } from 'components';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { DepositModel } from 'models';

import './CancelDropModal.scss';

const CancelDropModal = ({ deposits, limit }: { deposits?: DepositModel[]; limit: number }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [batch, setBatch] = useState(0);
    const [batchTotal, setBatchTotal] = useState(1);

    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.cancelDrop);
    const pool = useSelector((state: RootState) => state.pools.pools.find((p) => (deposits && deposits.length > 0 ? p.poolId === deposits[0]?.poolId : undefined)));

    const dispatch = useDispatch<Dispatch>();
    const steps = I18n.t('depositDrops.cancelDropModal.steps', {
        returnObjects: true,
        provider: WalletUtils.getAutoconnectProvider(),
    });

    const depositsTotalAmount = deposits ? deposits.reduce((acc, deposit) => NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0') + acc, 0) : 0;

    useEffect(() => {
        const handler = () => {
            setCurrentStep(1);
        };

        const cancelDropModal = document.getElementById('cancelDropModal');

        if (cancelDropModal) {
            cancelDropModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (cancelDropModal) {
                cancelDropModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    const onCancelDrop = async () => {
        if (!pool || !deposits || deposits.length === 0) {
            return;
        }

        const batchCount = Math.ceil(deposits.length / limit);

        setBatchTotal(batchCount);

        const res = await dispatch.wallet.cancelDrop({
            deposits,
            pool,
            onCancelCallback: (index) => setBatch(index),
            startIndex: batch,
            batchCount,
            limit,
        });

        if (!res) {
            setCurrentStep(1);
        } else {
            setCurrentStep(currentStep + 1);
            if (modalRef.current) {
                modalRef.current.hide();
            }
        }
    };

    return (
        <Modal id='cancelDropModal' ref={modalRef} modalWidth={1080}>
            <div className='row row-cols-1 row-cols-lg-2'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('depositDrops.cancelDropModal.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className='col'>
                    <Card withoutPadding className='d-flex flex-column justify-content-between px-3 px-sm-5 py-3 flex-grow-1 mt-5 mt-lg-0 glow-bg'>
                        <div className='h-100 d-flex flex-column text-center py-sm-4'>
                            <div className='mb-3 mb-sm-5 mb-lg-0'>
                                <div className='card-step-title' dangerouslySetInnerHTML={{ __html: steps[currentStep]?.cardTitle || steps[currentStep]?.title }} />
                                <div className='card-step-subtitle' dangerouslySetInnerHTML={{ __html: steps[currentStep]?.cardSubtitle || steps[currentStep]?.subtitle }} />
                            </div>
                            <div className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
                                <div className='warnings mt-4 text-start'>
                                    <p>{I18n.t('mySavings.leavePoolModal.warnings.title')}</p>
                                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3'>
                                        {I18n.t('mySavings.leavePoolModal.warnings.draws')}
                                    </Card>
                                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3 my-2'>
                                        {I18n.t('mySavings.leavePoolModal.warnings.cancel')}
                                    </Card>
                                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3'>
                                        {I18n.t('mySavings.leavePoolModal.warnings.waiting', { unbondingTime: pool?.internalInfos?.unbondingTime || 21 })}
                                    </Card>
                                </div>
                                <div className='w-100 mt-4'>
                                    <Card flat withoutPadding className='d-flex flex-row align-items-center justify-content-between px-4 py-3 last-step-card mt-2'>
                                        <div className='asset-info d-flex flex-row'>
                                            <img
                                                src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(deposits && deposits[0] && deposits[0].amount ? deposits[0]?.amount.denom : ''))}
                                                className='me-3'
                                                alt='denom'
                                            />
                                            <span className='d-none d-sm-block'>
                                                {DenomsUtils.getNormalDenom(deposits && deposits[0] && deposits[0].amount ? deposits[0]?.amount.denom : '').toUpperCase()}
                                            </span>
                                        </div>
                                        <div className='deposit-amount'>
                                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(depositsTotalAmount)} />
                                        </div>
                                    </Card>
                                </div>
                                <div className='mt-4'>
                                    <Card flat withoutPadding className='fees-warning mt-4'>
                                        <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                            <img src={Assets.images.info} alt='info' />
                                            <Tooltip id='fees-tooltip' delay={2000} />
                                        </span>
                                        {I18n.t('deposit.feesWarning')}
                                    </Card>
                                    {batch > 0 && batchTotal > 1 && <TransactionBatchProgress batch={batch} batchTotal={batchTotal} className='mt-4' />}
                                    <Button
                                        type='submit'
                                        onClick={() => {
                                            onCancelDrop().finally(() => null);
                                        }}
                                        className='w-100 mt-4'
                                        disabled={isLoading}
                                        loading={isLoading}
                                    >
                                        {I18n.t('depositDrops.cancelDropModal.cta')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default CancelDropModal;
