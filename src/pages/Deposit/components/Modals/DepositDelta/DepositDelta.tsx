import React from 'react';
import { useSelector } from 'react-redux';

import { Button, Modal } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { RootState } from 'redux/store';
import { I18n } from 'utils';

const DepositDelta = ({ modalRef, onContinue }: { modalRef: React.RefObject<ModalHandlers>; onContinue: () => void }) => {
    const depositDelta = useSelector((state: RootState) => state.pools.depositDelta);

    return (
        <Modal id='depositDeltaModal' ref={modalRef}>
            <div>
                You are depositing after the deposit delta of {(depositDelta || 300) / 60} minutes.
                <br />
                You will be eligible only from the next draw, this is the ensure security and avoid spamming transactions to false draw results
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between mt-4'>
                <Button outline className='w-100 me-2' onClick={() => modalRef.current?.hide()}>
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
