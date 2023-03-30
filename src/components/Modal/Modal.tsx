import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';

import './Modal.scss';

interface IProps {
    id: string;
    children?: React.ReactNode;
    withCloseButton?: boolean;
    contentClassName?: string;
    bodyClassName?: string;
    dataBsBackdrop?: 'static' | 'true';
    onCloseButtonPress?: () => void;
    modalWidth?: number;
}

export interface ModalHandlers {
    toggle: () => void;
    show: () => void;
    hide: () => void;
}

const Modal: React.ForwardRefRenderFunction<ModalHandlers, IProps> = (props, ref) => {
    const { id, children, bodyClassName, contentClassName, onCloseButtonPress, withCloseButton = true, dataBsBackdrop = 'true', modalWidth = 650 } = props;

    const modalRef = useRef<HTMLDivElement>(null);
    const bootstrapModalRef = useRef<BootstrapModal>();

    useEffect(() => {
        if (modalRef.current) {
            bootstrapModalRef.current = new BootstrapModal(modalRef.current, {});
        }
    }, [modalRef]);

    useImperativeHandle(
        ref,
        () => ({
            toggle: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.toggle();
                }
            },
            show: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.show();
                }
            },
            hide: () => {
                if (bootstrapModalRef.current) {
                    bootstrapModalRef.current.hide();
                }
            },
        }),
        [bootstrapModalRef],
    );

    return (
        <div tabIndex={-1} id={id} className='modal fade' aria-labelledby={`${id}Label`} aria-hidden='true' data-bs-backdrop={dataBsBackdrop} ref={modalRef}>
            <div
                className='modal-dialog modal-dialog-centered'
                style={
                    {
                        '--bs-modal-width': `${modalWidth}px`,
                    } as React.CSSProperties
                }
            >
                <div className={`border-0 text-center modal-content p-5 ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type='button'
                            onClick={onCloseButtonPress}
                            className='close-btn bg-white rounded-circle d-flex align-self-end justify-content-center align-items-center border-0 mb-5'
                            data-bs-dismiss='modal'
                            data-bs-target={id}
                            aria-label='Close'
                        >
                            <div className='btn-close mx-auto' />
                        </button>
                    )}
                    <div className={`modal-body p-0 ${bodyClassName}`}>{children}</div>
                </div>
            </div>
        </div>
    );
};

Modal.displayName = 'Modal';

export default React.forwardRef(Modal);
