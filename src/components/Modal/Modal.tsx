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
}

interface Handlers {
    toggle: () => void;
    show: () => void;
    hide: () => void;
}

const Modal: React.ForwardRefRenderFunction<Handlers, IProps> = (props, ref) => {
    const { id, children, bodyClassName, contentClassName, onCloseButtonPress, withCloseButton = true, dataBsBackdrop = 'true' } = props;

    const modalRef = useRef<HTMLDivElement>(null);
    const bootstrapModalRef = useRef<BootstrapModal>();

    useEffect(() => {
        if (modalRef.current) {
            bootstrapModalRef.current = new BootstrapModal(modalRef.current, {});

            modalRef.current.addEventListener('shown.bs.modal', () => {
                const ellipsisEls = document.querySelectorAll('#ellipsis');
                ellipsisEls.forEach((ellipsis) => {
                    ellipsis.classList.add('show');
                });
            });

            modalRef.current.addEventListener('hide.bs.modal', () => {
                const ellipsisEls = document.querySelectorAll('#ellipsis');
                ellipsisEls.forEach((ellipsis) => {
                    ellipsis.classList.remove('show');
                });
            });
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
            <div className='modal-dialog modal-dialog-centered my-5'>
                <div className={`border-0 text-center position-relative modal-content ${contentClassName}`}>
                    {withCloseButton && (
                        <button
                            type='button'
                            onClick={onCloseButtonPress}
                            className='close-btn bg-white rounded-circle d-flex align-self-center justify-content-center align-items-center'
                            data-bs-dismiss='modal'
                            data-bs-target={id}
                            aria-label='Close'
                        >
                            <div className='btn-close mx-auto' />
                        </button>
                    )}
                    <div className={`modal-body position-relative p-0 mx-auto ${bodyClassName}`}>
                        <div className='content m-3 px-4 py-5'>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

Modal.displayName = 'Modal';

export default React.forwardRef(Modal);
