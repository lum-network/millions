import React from 'react';

import './ToastContent.scss';

export interface ToastContentProps {
    title?: string;
    content?: string;
}

export const ToastContent = (props: ToastContentProps) => {
    return (
        <div className='toast-content-container ms-sm-3 ms-2'>
            <div className='toast-title'>{props.title}</div>
            <div className='toast-content mt-2 text-wrap me-5'>{props.content}</div>
        </div>
    );
};
