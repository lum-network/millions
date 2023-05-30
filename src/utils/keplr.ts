import { ChainInfo, Window } from '@keplr-wallet/types';
import { I18n } from 'utils';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};

export const enableKeplrWithInfos = (infos: ChainInfo) => {
    const keplrWindow = window as Window;

    if (!keplrWindow.keplr) {
        throw new Error(I18n.t('errors.keplr.notInstalled'));
    }

    return keplrWindow.keplr.experimentalSuggestChain(infos);
};
