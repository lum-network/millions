import React from 'react';

import Assets from 'assets';
import { Button, Card, Modal } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { I18n } from 'utils';

const IbcTransfer = ({ modalRef, onConfirm }: { modalRef: React.RefObject<ModalHandlers>; onConfirm: () => void }) => {
    return (
        <Modal id='ibcTransferModal' ref={modalRef}>
            <img src={Assets.images.info} alt='info' width={42} height={42} />
            <h3 className='mt-4'>{I18n.t('deposit.ibcTransferModal.title')}</h3>
            <Card flat withoutPadding className='deposit-warning my-4'>
                {I18n.t('deposit.ibcTransferModal.subtitle')}
            </Card>
            <div className='d-flex flex-row align-self-stretch justify-content-between'>
                <Button outline className='w-100' data-bs-dismiss='modal'>
                    {I18n.t('common.cancel')}
                </Button>
                <Button className='w-100 ms-4' data-bs-dismiss='modal' onClick={onConfirm}>
                    {I18n.t('common.continue')}
                </Button>
            </div>
        </Modal>
    );
};

export default IbcTransfer;
