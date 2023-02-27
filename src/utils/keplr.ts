import { Window } from '@keplr-wallet/types';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};
