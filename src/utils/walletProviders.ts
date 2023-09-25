import { ChainInfo, Window } from '@keplr-wallet/types';
import { getOfflineSigner } from '@cosmostation/cosmos-client';
import { cosmos } from '@cosmostation/extension-client';

import { WalletProvider, PoolsConstants } from 'constant';
import { I18n } from 'utils';

export const isKeplrInstalled = (): boolean => {
    const keplrWindow = window as Window;

    return !!keplrWindow.keplr;
};

export const isCosmostationInstalled = (): boolean => {
    return !!window.cosmostation;
};

export const isAnyWalletInstalled = (): boolean => {
    return isCosmostationInstalled() || isKeplrInstalled();
};

export const getProviderFunctions = (provider: WalletProvider) => {
    return {
        enable: (chainId: string) => {
            if (provider === WalletProvider.Cosmostation) {
                return null;
            }

            const keplrProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (keplrProvider) {
                return keplrProvider.enable(chainId);
            }

            throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
        },
        getOfflineSigner: (chainId: string) => {
            if (provider === WalletProvider.Cosmostation) {
                if (isCosmostationInstalled()) {
                    return getOfflineSigner(chainId);
                } else {
                    throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
                }
            }

            const keplrProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (keplrProvider) {
                return keplrProvider.getOfflineSignerAuto(chainId);
            }

            throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
        },
    };
};

export const suggestChain = async (walletProvider: WalletProvider, chainInfo: ChainInfo) => {
    if (walletProvider === WalletProvider.Cosmostation) {
        const infos = {
            chainId: chainInfo.chainId,
            addressPrefix: chainInfo.bech32Config.bech32PrefixAccAddr,
            baseDenom: chainInfo.currencies[0].coinMinimalDenom,
            chainName: chainInfo.chainName || chainInfo.chainId,
            displayDenom: chainInfo.currencies[0].coinDenom,
            decimals: chainInfo.currencies[0].coinDecimals,
            restURL: chainInfo.rest,
            coinType: String(chainInfo.bip44.coinType),
            gasRate: chainInfo.feeCurrencies[0]?.gasPriceStep
                ? {
                      tiny: String(chainInfo.feeCurrencies[0].gasPriceStep.low),
                      low: String(chainInfo.feeCurrencies[0].gasPriceStep.average),
                      average: String(chainInfo.feeCurrencies[0].gasPriceStep.high),
                  }
                : undefined,
        };

        const provider = await cosmos();
        const activatedChainIds = await provider.getActivatedChainIds();

        if (PoolsConstants.USED_CHAIN_IDS.every((chainId) => activatedChainIds.includes(chainId))) {
            return null;
        }
        return provider.addChain(infos);
    }

    const provider = walletProvider === WalletProvider.Keplr ? window.keplr : window.leap;

    return provider?.experimentalSuggestChain(chainInfo);
};

export const requestCosmostationAccount = async (chainId: string) => {
    const provider = await cosmos();
    const account = await provider.requestAccount(chainId);

    return account;
};
