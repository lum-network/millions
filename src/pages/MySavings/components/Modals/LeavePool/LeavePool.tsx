import Assets from 'assets';
import { Button, Card, Modal, SmallerDecimal, Steps, Tooltip } from 'components';
import { DepositModel } from 'models';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import { DenomsUtils, Firebase, I18n, NumbersUtils, WalletUtils } from 'utils';
import { FirebaseConstants } from 'constant';

import './LeavePool.scss';

interface Props {
    deposit: DepositModel | null;
}

const LeavePool = ({ deposit }: Props) => {
    const [currentStep, setCurrentStep] = useState(1);
    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const dispatch = useDispatch<Dispatch>();

    const pool = useSelector((state: RootState) => state.pools.pools.find((p) => (deposit ? p.poolId.eq(deposit?.poolId) : undefined)));
    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.leavePool);

    const steps = I18n.t('mySavings.leavePoolModal.steps', {
        returnObjects: true,
        provider: WalletUtils.getAutoconnectProvider(),
    });

    const onLeavePool = async () => {
        if (!deposit) {
            return;
        }

        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEAVE_POOL_CONFIRMED, {
            pool_id: deposit.poolId?.toString(),
            deposit_id: deposit.depositId?.toString(),
            amount: NumbersUtils.convertUnitNumber(deposit.amount?.amount || 0),
            denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
        });

        const res = await dispatch.wallet.leavePool({
            poolId: deposit.poolId,
            depositId: deposit.depositId,
            denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
        });

        if (!res || (res && res.error)) {
            setCurrentStep(1);
        } else {
            setCurrentStep(currentStep + 1);
            if (modalRef.current) {
                modalRef.current.hide();
            }
        }
    };

    useEffect(() => {
        const handler = () => {
            setCurrentStep(1);
        };

        const leavePoolModal = document.getElementById('leavePoolModal');

        if (leavePoolModal) {
            leavePoolModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (leavePoolModal) {
                leavePoolModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    return (
        <Modal id='leavePoolModal' ref={modalRef} modalWidth={1080}>
            <div className='row row-cols-1 row-cols-lg-2'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('mySavings.leavePoolModal.title')}</h1>
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
                                            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(deposit?.amount?.denom || ''))} className='me-3 no-filter' alt='denom' />
                                            <span className='d-none d-sm-block'>{DenomsUtils.getNormalDenom(deposit?.amount?.denom || '').toUpperCase()}</span>
                                        </div>
                                        <div className='deposit-amount'>
                                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(deposit?.amount?.amount || '0'))} />
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
                                    <Button
                                        type='submit'
                                        onClick={() => {
                                            onLeavePool().finally(() => null);
                                        }}
                                        className='w-100 mt-4'
                                        disabled={isLoading}
                                        loading={isLoading}
                                        forcePurple
                                    >
                                        {I18n.t('mySavings.leavePoolModal.cta')}
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

export default LeavePool;
