import React from 'react';

import { I18n, KeplrUtils, StringsUtils, ToastUtils } from 'utils';

import Button from '../Button/Button';

const ConnectButton = ({ address, onClick }: { address: string | undefined; onClick: () => void }) => {
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address).then(
                () => {
                    ToastUtils.showSuccessToast({ content: I18n.t('common.copiedAddress') });
                },
                () => {
                    ToastUtils.showErrorToast({ content: I18n.t('errors.copyAddress') });
                },
            );
        }
    };

    if (address) {
        return (
            <Button
                outline
                className='flex-grow-1'
                onClick={() => {
                    copyAddress();
                    onClick();
                }}
            >
                {StringsUtils.trunc(address)}
            </Button>
        );
    }

    return (
        <Button outline data-bs-toggle='modal' data-bs-target={!KeplrUtils.isKeplrInstalled() ? '#get-keplr-modal' : '#choose-wallet-modal'} className='flex-grow-1' onClick={onClick}>
            {I18n.t('connectWallet')}
        </Button>
    );
};

export default ConnectButton;
