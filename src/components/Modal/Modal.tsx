import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { Modal as BootstrapModal } from 'bootstrap';

import { useColorScheme } from 'hooks';

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
    const { isDark } = useColorScheme();

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
                <div className={`border-0 text-center modal-content ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type='button'
                            onClick={onCloseButtonPress}
                            className='close-btn bg-transparent rounded-circle d-flex align-self-end justify-content-center align-items-center border-0 position-absolute top-0 end-0 mt-3 me-3'
                            data-bs-dismiss='modal'
                            data-bs-target={id}
                            aria-label='Close'
                        >
                            <div className={`btn-close ${isDark ? 'btn-close-white' : ''}`} />
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
