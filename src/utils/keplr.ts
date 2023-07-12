import { ChainInfo, Keplr, Window } from '@keplr-wallet/types';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};

export const enableKeplrWithInfos = (provider: Keplr, infos: ChainInfo) => {
    return provider.experimentalSuggestChain(infos);
};
