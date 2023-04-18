import { ChainInfo, Window } from '@keplr-wallet/types';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};

export const enableKeplrWithInfos = (infos: ChainInfo) => {
    const keplrWindow = window as Window;

    if (!keplrWindow.keplr) {
        throw new Error('Keplr is not installed');
    }

    return keplrWindow.keplr.experimentalSuggestChain(infos);
};
