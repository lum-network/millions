import { ChainInfo, Key, Window } from '@keplr-wallet/types';
import { cosmos } from '@cosmostation/extension-client';

import { WalletProvider, PoolsConstants } from 'constant';
import { I18n } from 'utils';
import { fromBech32 } from '@lum-network/sdk-javascript';

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

const isProviderInstalled = (provider: WalletProvider) => {
    return provider === WalletProvider.Cosmostation ? isCosmostationInstalled() : isKeplrInstalled();
};

export const getProviderFunctions = (provider: WalletProvider) => {
    if (!isProviderInstalled(provider)) {
        return null;
    }

    return {
        enable: (chainId: string) => {
            if (provider === WalletProvider.Cosmostation) {
                return null;
            }

            const keplrProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (!keplrProvider) {
                throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
            }

            return keplrProvider.enable(chainId);
        },
        getOfflineSigner: async (chainId: string) => {
            if (provider === WalletProvider.Cosmostation) {
                if (isCosmostationInstalled() && window.cosmostation?.providers?.keplr) {
                    return await window.cosmostation.providers.keplr.getOfflineSignerAuto(chainId);
                } else {
                    throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
                }
            }

            const keplrProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (!keplrProvider) {
                throw new Error(I18n.t('errors.walletProvider.notInstalled', { provider }));
            }

            return await keplrProvider.getOfflineSignerAuto(chainId);
        },
        getKey: async (chainId: string): Promise<Key> => {
            if (provider === WalletProvider.Cosmostation) {
                if (!isCosmostationInstalled()) {
                    return {
                        address: new Uint8Array(),
                        pubKey: new Uint8Array(),
                        name: '',
                        algo: '',
                        isNanoLedger: false,
                        isKeystone: false,
                        bech32Address: '',
                    };
                }
                const account = await requestCosmostationAccount(chainId);

                return {
                    address: fromBech32(account.address).data,
                    bech32Address: account.address,
                    name: account.name,
                    algo: 'secp256k1',
                    isNanoLedger: account.isLedger,
                    pubKey: account.publicKey,
                    isKeystone: false,
                };
            }

            const keplrProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (!keplrProvider) {
                return {
                    address: new Uint8Array(),
                    pubKey: new Uint8Array(),
                    name: '',
                    algo: '',
                    isNanoLedger: false,
                    isKeystone: false,
                    bech32Address: '',
                };
            }

            return await keplrProvider.getKey(chainId);
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

    return await provider.requestAccount(chainId);
};
