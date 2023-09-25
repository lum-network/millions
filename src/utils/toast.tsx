import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { Id, TypeOptions } from 'react-toastify/dist/types';

import { ToastContentProps, ToastContent } from 'components';

import successIcon from 'assets/images/success.svg';
import warningIcon from 'assets/images/warning.svg';
import infoIcon from 'assets/images/info.svg';

export const showErrorToast = (content: ToastContentProps, options?: ToastOptions): void => {
    toast.error(<ToastContent {...content} />, {
        icon: () => <img alt='warning' src={warningIcon} />,
        closeButton: false,
        ...options,
    });
};

export const showSuccessToast = (content: ToastContentProps, options?: ToastOptions): void => {
    toast.success(<ToastContent {...content} />, {
        icon: () => <img alt='success' src={successIcon} />,
        closeButton: false,
        ...options,
    });
};

export const showInfoToast = (content: ToastContentProps, options?: ToastOptions): void => {
    toast.info(<ToastContent {...content} />, {
        icon: () => <img alt='Cosmos Millions logo' src={infoIcon} />,
        closeButton: false,
        ...options,
    });
};

export const showLoadingToast = (content: ToastContentProps, options?: ToastOptions): Id => {
    return toast.loading(<ToastContent {...content} />, {
        closeButton: false,
        ...options,
    });
};

export const updateLoadingToast = (toastId: Id, type: TypeOptions, content: ToastContentProps, options?: ToastOptions): void => {
    toast.update(toastId, {
        render: <ToastContent {...content} />,
        icon: () => <img alt={type === 'success' ? 'success' : 'warning'} src={type === 'success' ? successIcon : warningIcon} />,
        type,
        isLoading: false,
        autoClose: 5000,
        ...options,
    });
};

export const updateToastContent = (toastId: Id, content: ToastContentProps) => {
    toast.update(toastId, {
        render: <ToastContent {...content} />,
    });
};
