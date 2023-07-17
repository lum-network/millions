import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { LumUtils } from '@lum-network/sdk-javascript';

import Assets from 'assets';

import { Button, Card, Modal, Steps, Tooltip } from 'components';
import { DepositModel } from 'models';
import { RootState, Dispatch } from 'redux/store';
import { I18n, NumbersUtils, WalletUtils } from 'utils';

import './EditDepositModal.scss';

const EditDepositModal = ({ deposit }: { deposit: DepositModel | null }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [address, setAddress] = useState(deposit ? deposit.winnerAddress : '');
    const [addressError, setAddressError] = useState('');
    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.cancelDrop);
    const pool = useSelector((state: RootState) => state.pools.pools.find((p) => (deposit ? p.poolId.eq(deposit.poolId) : undefined)));

    const dispatch = useDispatch<Dispatch>();
    const steps = I18n.t('depositDrops.editDropModal.steps', {
        returnObjects: true,
        provider: WalletUtils.getAutoconnectProvider(),
    });

    useEffect(() => {
        const handler = () => {
            setCurrentStep(0);
        };

        const editDepositModal = document.getElementById('editDepositModal');

        if (editDepositModal) {
            editDepositModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (editDepositModal) {
                editDepositModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    useEffect(() => {
        if (deposit) {
            setAddress(deposit.winnerAddress);
        }
    }, [deposit]);

    const onAddressChange = (newAddress: string) => {
        setAddress(newAddress);

        if (newAddress && !LumUtils.isAddressValid(newAddress)) {
            setAddressError(I18n.t('errors.generic.invalid', { field: 'lum address' }));
        } else {
            setAddressError('');
        }
    };

    const onEditDeposit = async () => {
        if (!deposit || !pool || !address || address === deposit?.winnerAddress) {
            return null;
        }

        setCurrentStep(currentStep + 1);

        const res = await dispatch.wallet.editDrop({
            pool,
            deposit,
            newWinnerAddress: address,
        });

        if (!res || (res && res.error)) {
            setCurrentStep(0);
        } else {
            setCurrentStep(currentStep + 1);
            if (modalRef.current) {
                modalRef.current.hide();
            }
        }
    };

    return (
        <Modal id='editDepositModal' ref={modalRef} modalWidth={1080}>
            <div className='row row-cols-1 row-cols-lg-2'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('depositDrops.editDropModal.title')}</h1>
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
                                <div className='w-100 mt-4'>
                                    <Card withoutPadding flat className='d-flex flex-column align-items-stretch p-4'>
                                        <div className='d-flex flex-column'>
                                            <label className='text-start mb-2'>{I18n.t('depositDrops.depositFlow.winnerAddress')}</label>
                                            <input
                                                className={`edit-address-input ${addressError && 'error'}`}
                                                spellCheck={false}
                                                value={address}
                                                onChange={(event) => onAddressChange(event.target.value)}
                                            />
                                            {addressError ? <p className='error-message mb-0 mt-2 text-start'>{addressError}</p> : null}
                                        </div>
                                        <div className='input-container d-flex flex-column mt-5'>
                                            <label className='text-start mb-2'>{I18n.t('depositDrops.depositFlow.amount')}</label>
                                            <input disabled className='edit-amount-input' value={NumbersUtils.convertUnitNumber(deposit?.amount?.amount || '0')} />
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
                                            onEditDeposit().finally(() => null);
                                        }}
                                        className='w-100 mt-4'
                                        disabled={isLoading}
                                        loading={isLoading}
                                    >
                                        {I18n.t('depositDrops.editDropModal.cta')}
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

export default EditDepositModal;
