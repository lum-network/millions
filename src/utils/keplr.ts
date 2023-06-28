import { ChainInfo, Keplr, Window } from '@keplr-wallet/types';
import { I18n } from 'utils';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};

export const enableKeplrWithInfos = (provider: Keplr, infos: ChainInfo) => {
    if (!provider) {
        throw new Error(I18n.t('errors.keplr.notInstalled'));
    }

    return provider.experimentalSuggestChain(infos);
};
