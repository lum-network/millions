import React from 'react';
import { Blocker } from '@remix-run/router';

import Assets from 'assets';
import { Button, Modal } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { I18n } from 'utils';

const QuitDepositModal = ({ modalRef, blocker }: { modalRef: React.RefObject<ModalHandlers>; blocker: Blocker }) => {
    return (
        <Modal id='quitModal' ref={modalRef} withCloseButton={false} dataBsBackdrop='static' bodyClassName='d-flex flex-column align-items-center'>
            <img src={Assets.images.info} alt='info' width={42} height={42} />
            <h3 className='my-4'>{I18n.t('deposit.quitModal.title')}</h3>
            <div className='d-flex flex-row align-self-stretch justify-content-between'>
                <Button
                    outline
                    className='w-100'
                    onClick={() => {
                        if (modalRef && modalRef.current) {
                            modalRef.current.hide();
                        }
                        blocker.proceed?.();
                    }}
                >
                    {I18n.t('common.continue')}
                </Button>
                <Button
                    className='w-100 ms-4'
                    onClick={() => {
                        if (modalRef.current) {
                            modalRef.current.hide();
                        }
                        blocker.reset?.();
                    }}
                >
                    {I18n.t('common.cancel')}
                </Button>
            </div>
        </Modal>
    );
};

export default QuitDepositModal;
