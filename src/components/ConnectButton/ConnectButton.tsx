import React from 'react';

import { Firebase, I18n, WalletProvidersUtils, StringsUtils, ToastUtils } from 'utils';
import { FirebaseConstants } from 'constant';

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
                className='w-100'
                onClick={() => {
                    copyAddress();
                    Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.ADDRESS_COPIED);
                    onClick();
                }}
            >
                {StringsUtils.trunc(address)}
            </Button>
        );
    }

    return (
        <Button
            outline
            data-bs-toggle='modal'
            data-bs-target={WalletProvidersUtils.isAnyWalletInstalled() ? '#choose-wallet-modal' : '#get-keplr-modal'}
            className='w-100'
            onClick={() => {
                Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.SIGN_IN);
                onClick();
            }}
        >
            {I18n.t('connectWallet')}
        </Button>
    );
};

export default ConnectButton;
