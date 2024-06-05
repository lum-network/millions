import React from 'react';

import './ToastContent.scss';

export interface ToastContentProps {
    title?: string;
    content?: string;
}

export const ToastContent = (props: ToastContentProps) => {
    return (
        <div className='toast-content-container ms-sm-3 ms-2'>
            <div className='toast-title' dangerouslySetInnerHTML={{ __html: props.title || '' }} />
            <div className='toast-content mt-2 text-wrap me-5' dangerouslySetInnerHTML={{ __html: props.content || '' }} />
        </div>
    );
};
