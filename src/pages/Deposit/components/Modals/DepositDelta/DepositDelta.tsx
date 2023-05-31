import React from 'react';
import { useSelector } from 'react-redux';

import { Button, Modal } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { RootState } from 'redux/store';
import { I18n } from 'utils';
import Assets from 'assets';

const DepositDelta = ({ modalRef, onContinue }: { modalRef: React.RefObject<ModalHandlers>; onContinue: () => void }) => {
    const depositDelta = useSelector((state: RootState) => state.pools.depositDelta);

    return (
        <Modal id='depositDeltaModal' ref={modalRef}>
            <img src={Assets.images.info} alt='info' width={42} height={42} />
            <h3 className='mt-4'>{I18n.t('deposit.depositDeltaModal.title', { delta: (depositDelta || 300) / 60 })}</h3>
            <div className='d-flex flex-row align-items-center justify-content-between mt-5'>
                <Button outline className='w-100 me-4' onClick={() => modalRef.current?.hide()}>
                    {I18n.t('common.cancel')}
                </Button>
                <Button className='w-100' onClick={onContinue}>
                    {I18n.t('common.continue')}
                </Button>
            </div>
        </Modal>
    );
};

export default DepositDelta;
