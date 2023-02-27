import { createModel } from '@rematch/core';
import { LumConstants, LumTypes, LumUtils, LumWallet, LumWalletFactory } from '@lum-network/sdk-javascript';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import Long from 'long';
import dayjs from 'dayjs';

import { ToastUtils, I18n, LumClient, DenomsUtils, OsmosisClient } from 'utils';
import { DenomsConstants, LUM_COINGECKO_ID, LUM_WALLET_LINK } from 'constant';
import { RootModel } from '.';

interface IbcTransferPayload {
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin;
    type: 'withdraw' | 'deposit';
    normalDenom: string;
}

interface WalletState {
    lumWallet: {
        innerWallet: LumWallet;
        address: string;
        balances: LumTypes.Coin[];
        activities: any[];
    } | null;
    osmosisWallet: {
        address: string;
    } | null;
    prizeToClaim: LumTypes.Coin | null;
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
                    balances: [],
                    activities: [],
                },
            };
        },
        signInOsmosis(state, payload: { address: string; offlineSigner: OfflineSigner }) {
            return {
                ...state,
                osmosisWallet: {
                    address: payload.address,
                    offlineSigner: payload.offlineSigner,
                    balances: [],
                },
            };
        },
        setWalletData(state, payload: { balances?: LumTypes.Coin[]; activities?: any[] }) {
            return {
                ...state,
                ...(state.lumWallet && {
                    lumWallet: {
                        ...state.lumWallet,
                        balances: payload.balances || state.lumWallet.balances,
                        activities: payload.activities || state.lumWallet.activities,
                    },
                }),
            };
        },
        setPrizeToClaim(state, payload: LumTypes.Coin | null) {
            return {
                ...state,
                prizeToClaim: payload,
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
                        dispatch.wallet.signInLum(lumWallet);
                        dispatch.wallet.getBalances(lumWallet.getAddress());

                        /*  dispatch.wallet.getHistory(lumWallet.getAddress());
                            dispatch.wallet.getTransactions(lumWallet.getAddress()); */
                        if (!silent) ToastUtils.showSuccessToast({ content: 'Successfully connected' });
                    }

                    const osmosisOfflineSigner = await keplrWindow.getOfflineSignerAuto('osmosis-1');
                    const accounts = await osmosisOfflineSigner.getAccounts();
                    if (accounts.length > 0) {
                        dispatch.wallet.signInOsmosis({
                            address: accounts[0].address,
                            offlineSigner: osmosisOfflineSigner,
                        });
                        //await OsmosisClient.connect(osmosisOfflineSigner);
                        //dispatch.wallet.getOsmosisWalletBalance(null);
                    }
                    return;
                } catch (e) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.wallet') });
                    throw e;
                }
            }
        },
        async getBalances(address: string) {
            try {
                const result = await LumClient.getWalletBalances(address);

                if (result) {
                    const filteredBalances = result.balances.filter((balance) => DenomsConstants.ALLOWED_DENOMS.includes(DenomsUtils.getNormalDenom(balance.denom)));
                    dispatch.wallet.setWalletData({ balances: filteredBalances });
                }
            } catch (e) {}
        },
        async getActivities(address: string) {
            try {
                const result = await LumClient.getWalletActivites(address);

                if (result) {
                    dispatch.wallet.setWalletData({ activities: result.activities });
                }
            } catch (e) {}
        },
        async getPrizeToClaim(address: string) {
            dispatch.wallet.setPrizeToClaim(null);
        },
        async ibcTransfer(payload: IbcTransferPayload) {
            const { toAddress, fromAddress, amount, normalDenom } = payload;

            const convertedAmount = LumUtils.convertUnit(
                {
                    amount: amount.amount,
                    denom: LumConstants.LumDenom,
                },
                LumConstants.MicroLumDenom,
            );

            const coin = {
                amount: convertedAmount,
                denom: amount.denom,
            };

            const toastId = ToastUtils.showLoadingToast({ content: payload.type === 'withdraw' ? 'Withdrawing...' : 'Depositing...' });

            const chainId = LumClient.getChainId();

            if (chainId) {
                try {
                    if (payload.type === 'withdraw') {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        const lumOfflineSigner = await (window as KeplrWindow).getOfflineSignerAuto!(chainId);

                        const client = await SigningStargateClient.connectWithSigner(LumClient.getRpc(), lumOfflineSigner);

                        const result = await client.sendIbcTokens(
                            fromAddress,
                            toAddress,
                            coin,
                            'transfer',
                            'channel-3',
                            {
                                revisionHeight: Long.fromNumber(0),
                                revisionNumber: Long.fromNumber(0),
                            },
                            dayjs().utc().add(5, 'minutes').unix().valueOf(),
                            {
                                amount: [],
                                gas: '200000',
                            },
                        );

                        if (result && result.code === 0) {
                            ToastUtils.updateLoadingToast(toastId, 'success', { content: `Successfully withdrawn ${amount.amount} ${normalDenom.toUpperCase()}` });
                            //dispatch.wallet.reloadWalletInfos(null);
                        } else {
                            ToastUtils.updateLoadingToast(toastId, 'error', { content: result.rawLog || 'Failed to withdraw' });
                        }
                    } else {
                        const result = await OsmosisClient.ibcTransfer(fromAddress, toAddress, coin);

                        if (result && result.error) {
                            ToastUtils.updateLoadingToast(toastId, 'error', { content: result.error || 'Failed to deposit' });
                        } else {
                            ToastUtils.updateLoadingToast(toastId, 'success', { content: `Successfully deposited ${amount.amount} ${normalDenom.toUpperCase()}` });
                            //dispatch.wallet.reloadWalletInfos(null);
                        }
                    }
                } catch (e) {
                    ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to ${payload.type}` });
                }
            } else {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: `Unable to get lum network chainId to ${payload.type}.` });
            }
        },
    }),
});
