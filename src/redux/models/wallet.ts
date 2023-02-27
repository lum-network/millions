import { createModel } from '@rematch/core';
import { LumConstants, LumWallet, LumWalletFactory } from '@lum-network/sdk-javascript';
import { Window as KeplrWindow } from '@keplr-wallet/types';

import { ToastUtils, I18n, LumClient } from 'utils';
import { LUM_COINGECKO_ID, LUM_WALLET_LINK } from 'constant';
import { RootModel } from '.';

interface WalletState {
    lumWallet: {
        innerWallet: LumWallet;
        address: string;
    } | null;
    osmosisWallet: {
        address: string;
    } | null;
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        lumWallet: null,
        osmosisWallet: null,
    } as WalletState,
    reducers: {
        signInLum(state, payload: LumWallet) {
            return {
                ...state,
                lumWallet: {
                    innerWallet: payload,
                    address: payload.getAddress(),
                },
            };
        },
    },
    effects: (dispatch) => ({
        async connectWallet(payload: { silent: boolean }, state) {
            if (state.wallet.lumWallet) {
                return;
            }

            await LumClient.connect();

            const { silent } = payload;
            const keplrWindow = window as KeplrWindow;

            if (!keplrWindow.getOfflineSigner || !keplrWindow.keplr) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.notInstalled') });
            } else if (!keplrWindow.keplr.experimentalSuggestChain) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.notLatest') });
            } else {
                const chainId = LumClient.getChainId();
                const rpc = LumClient.getRpc();

                if (!chainId || !rpc) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.network') });
                    return;
                }

                try {
                    await keplrWindow.keplr.experimentalSuggestChain({
                        chainId: chainId,
                        chainName: chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                        rpc,
                        rest: rpc.replace('rpc', 'rest'),
                        stakeCurrency: {
                            coinDenom: LumConstants.LumDenom,
                            coinMinimalDenom: LumConstants.MicroLumDenom,
                            coinDecimals: LumConstants.LumExponent,
                            coinGeckoId: LUM_COINGECKO_ID,
                        },
                        walletUrlForStaking: LUM_WALLET_LINK,
                        bip44: {
                            coinType: 118,
                        },
                        bech32Config: {
                            bech32PrefixAccAddr: LumConstants.LumBech32PrefixAccAddr,
                            bech32PrefixAccPub: LumConstants.LumBech32PrefixAccPub,
                            bech32PrefixValAddr: LumConstants.LumBech32PrefixValAddr,
                            bech32PrefixValPub: LumConstants.LumBech32PrefixValPub,
                            bech32PrefixConsAddr: LumConstants.LumBech32PrefixConsAddr,
                            bech32PrefixConsPub: LumConstants.LumBech32PrefixConsPub,
                        },
                        currencies: [
                            {
                                coinDenom: LumConstants.LumDenom,
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                coinGeckoId: LUM_COINGECKO_ID,
                            },
                            {
                                coinDenom: 'dfr',
                                coinMinimalDenom: 'udfr',
                                coinDecimals: 6,
                            },
                        ],
                        // List of coin/tokens used as a fee token in this chain.
                        feeCurrencies: [
                            {
                                coinDenom: LumConstants.LumDenom,
                                coinMinimalDenom: LumConstants.MicroLumDenom,
                                coinDecimals: LumConstants.LumExponent,
                                coinGeckoId: LUM_COINGECKO_ID,
                                gasPriceStep: {
                                    low: 0.01,
                                    average: 0.025,
                                    high: 0.04,
                                },
                            },
                        ],
                        coinType: 118,
                        beta: chainId.includes('testnet'),
                    });
                } catch {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.networkAdd') });
                    return;
                }

                try {
                    await keplrWindow.keplr.enable(chainId);
                    if (!keplrWindow.getOfflineSignerAuto) {
                        throw 'Cannot fetch offline signer';
                    }
                    const lumOfflineSigner = await keplrWindow.getOfflineSignerAuto(chainId);
                    const lumWallet = await LumWalletFactory.fromOfflineSigner(lumOfflineSigner);
                    if (lumWallet) {
                        console.log('connectWallet');

                        dispatch.wallet.signInLum(lumWallet);
                        /* dispatch.wallet.getLumWalletBalance(null);
                            dispatch.wallet.getHistory(lumWallet.getAddress());
                            dispatch.wallet.getTransactions(lumWallet.getAddress()); */
                        if (!silent) ToastUtils.showSuccessToast({ content: 'Successfully connected' });
                    }

                    /* const osmosisOfflineSigner = await keplrWindow.getOfflineSignerAuto('osmosis-1');
                        const accounts = await osmosisOfflineSigner.getAccounts();
                        if (accounts.length > 0) {
                            dispatch.wallet.signInOsmosis({
                                address: accounts[0].address,
                                offlineSigner: osmosisOfflineSigner,
                            });
                            //await OsmosisClient.connect(osmosisOfflineSigner);
                            dispatch.wallet.getOsmosisWalletBalance(null);
                        } */
                    return;
                } catch (e) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.wallet') });
                    throw e;
                }
            }
        },
    }),
});
