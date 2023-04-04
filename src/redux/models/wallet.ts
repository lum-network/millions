import { createModel } from '@rematch/core';
import { LumConstants, LumTypes, LumUtils, LumWallet, LumWalletFactory } from '@lum-network/sdk-javascript';
import { Prize, PrizeState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import Long from 'long';

import { ToastUtils, I18n, LumClient, DenomsUtils, WalletClient, NumbersUtils } from 'utils';
import { DenomsConstants, LUM_COINGECKO_ID, LUM_WALLET_LINK } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel, DepositModel } from 'models';
import { RootModel } from '.';

interface IbcTransferPayload {
    fromAddress: string;
    toAddress: string;
    amount: LumTypes.Coin;
    type: 'withdraw' | 'deposit';
    ibcChannel: string;
    normalDenom: string;
    chainId: string;
}

interface SetWalletDataPayload {
    balances?: LumTypes.Coin[];
    activities?: any[];
    deposits?: DepositModel[];
}

interface SetOtherWalletPayload {
    denom: string;
    balances?: LumTypes.Coin[];
    address: string;
}

interface DepositToPoolPayload {
    amount: string;
    pool: PoolModel;
}

interface LeavePoolPayload {
    poolId: Long;
    denom: string;
    depositId: Long;
}

interface WalletState {
    lumWallet: LumWalletModel | null;
    otherWallets: {
        [denom: string]: OtherWalletModel;
    };
    prizesToClaim: Prize[];
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        lumWallet: null,
        otherWallets: {},
        prizesToClaim: [],
    } as WalletState,
    reducers: {
        signInLum(state, payload: LumWallet): WalletState {
            return {
                ...state,
                lumWallet: {
                    innerWallet: payload,
                    address: payload.getAddress(),
                    balances: [],
                    activities: [],
                    deposits: [],
                },
            };
        },
        setLumWalletData(state, payload: SetWalletDataPayload): WalletState {
            return {
                ...state,
                ...(state.lumWallet && {
                    lumWallet: {
                        ...state.lumWallet,
                        balances: payload.balances || state.lumWallet.balances,
                        activities: payload.activities || state.lumWallet.activities,
                        deposits: [...(payload.deposits || state.lumWallet.deposits)],
                    },
                }),
            };
        },
        setOtherWalletData(state, payload: SetOtherWalletPayload): WalletState {
            const { denom, ...data } = payload;
            return {
                ...state,
                otherWallets: {
                    ...state.otherWallets,
                    [denom]: {
                        address: data.address,
                        balances: data.balances || [],
                    },
                },
            };
        },
        setPrizeToClaim(state, payload: Prize[]): WalletState {
            return {
                ...state,
                prizesToClaim: payload,
            };
        },
    },
    effects: (dispatch) => ({
        async enableKeplrAndConnectLumWallet(payload: { silent: boolean }, state) {
            if (state.wallet.lumWallet) {
                return;
            }

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
                        rest: rpc.replace(rpc.includes('rpc') ? 'rpc' : '26657', rpc.includes('rpc') ? 'rest' : '1317'),
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
                    await keplrWindow.keplr.enable([...state.pools.pools.map((pool) => pool.chainId), chainId]);
                    if (!keplrWindow.getOfflineSignerAuto) {
                        throw 'Cannot fetch offline signer';
                    }
                    const lumOfflineSigner = await keplrWindow.getOfflineSignerAuto(chainId);
                    const lumWallet = await LumWalletFactory.fromOfflineSigner(lumOfflineSigner);
                    if (lumWallet) {
                        dispatch.wallet.signInLum(lumWallet);

                        await dispatch.wallet.reloadWalletinfos(lumWallet.getAddress());
                        if (!silent) ToastUtils.showSuccessToast({ content: 'Successfully connected' });
                    }
                } catch (e) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.wallet') });
                    throw e;
                }
            }
        },
        async connectOtherWallets(_, state) {
            const keplrWindow = window as KeplrWindow;
            if (keplrWindow.getOfflineSignerAuto) {
                for (const pool of state.pools.pools) {
                    try {
                        if (!pool.internalInfos) {
                            continue;
                        }

                        const offlineSigner = await keplrWindow.getOfflineSignerAuto(pool.chainId);
                        const accounts = await offlineSigner.getAccounts();
                        await WalletClient.connect(pool.internalInfos.rpc, offlineSigner);

                        if (accounts.length > 0) {
                            const res = await WalletClient.getWalletBalance(accounts[0].address);

                            dispatch.wallet.setOtherWalletData({
                                address: accounts[0].address,
                                balances: res
                                    ? DenomsUtils.translateIbcBalances([...res.balances], pool.transferChannelId, pool.nativeDenom).filter((balance) =>
                                          DenomsConstants.ALLOWED_DENOMS.includes(DenomsUtils.getNormalDenom(balance.denom)),
                                      )
                                    : [],
                                denom: DenomsUtils.getNormalDenom(pool.nativeDenom),
                            });
                        }

                        WalletClient.disconnect();
                    } catch {}
                }
            }
        },
        async reloadWalletinfos(address: string) {
            await dispatch.wallet.getLumWalletBalances(address);
            await dispatch.wallet.getPrizeToClaim(address);
            await dispatch.wallet.getActivities(address);
            await dispatch.wallet.getDeposits(address);
            await dispatch.wallet.getWithdrawals(address);
        },
        async getLumWalletBalances(address: string, state) {
            try {
                const result = await LumClient.getWalletBalances(address);

                if (result) {
                    const balances = await DenomsUtils.translateLumIbcBalances([...result.balances]);
                    const filteredBalances = balances.filter((balance) => state.pools.pools.find((pool) => pool.nativeDenom === balance.denom));
                    dispatch.wallet.setLumWalletData({ balances: filteredBalances });
                }
            } catch (e) {}
        },
        async getActivities(address: string) {
            try {
                const result = await LumClient.getWalletActivites(address);

                if (result) {
                    dispatch.wallet.setLumWalletData({ activities: [...result.activities] });
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getDeposits(address: string) {
            try {
                const res = await LumClient.getDeposits(address);
                if (res) {
                    dispatch.wallet.setLumWalletData({ deposits: res });
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getWithdrawals(address: string, state) {
            try {
                const res = await LumClient.getWithdrawals(address, state.wallet.lumWallet?.deposits || []);
                if (res) {
                    dispatch.wallet.setLumWalletData({ deposits: res });
                }
            } catch (e) {
                console.log(e);
            }
        },
        async getPrizeToClaim(address: string) {
            dispatch.wallet.setPrizeToClaim([
                {
                    poolId: Long.fromNumber(1),
                    drawId: Long.fromNumber(1),
                    prizeId: Long.fromNumber(1),
                    state: PrizeState.PRIZE_STATE_PENDING,
                    winnerAddress: 'lum',
                    amount: {
                        amount: '129029110',
                        denom: 'uosmo',
                    },
                    createdAtHeight: Long.fromNumber(1),
                    updatedAtHeight: Long.fromNumber(1),
                    expiresAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    poolId: Long.fromNumber(2),
                    drawId: Long.fromNumber(2),
                    prizeId: Long.fromNumber(2),
                    state: PrizeState.PRIZE_STATE_PENDING,
                    winnerAddress: 'lum',
                    amount: {
                        amount: '58208120',
                        denom: 'uatom',
                    },
                    createdAtHeight: Long.fromNumber(1),
                    updatedAtHeight: Long.fromNumber(1),
                    expiresAt: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
        },
        async ibcTransfer(payload: IbcTransferPayload, state) {
            const { toAddress, fromAddress, amount, normalDenom, type, ibcChannel, chainId } = payload;

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

            const toastId = ToastUtils.showLoadingToast({ content: type === 'withdraw' ? 'Withdrawing...' : 'Depositing...' });

            try {
                if (!chainId) {
                    throw new Error(`${normalDenom.toUpperCase()} chain-id not found`);
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const offlineSigner = await (window as KeplrWindow).getOfflineSignerAuto!(chainId);

                const rpc = type === 'withdraw' ? LumClient.getRpc() : state.pools.pools.find((pool) => pool.chainId === chainId)?.internalInfos?.rpc;

                if (!rpc) {
                    throw new Error(`${normalDenom.toUpperCase()} rpc is unavailble.`);
                }

                await WalletClient.connect(rpc, offlineSigner);

                const result = await WalletClient.ibcTransfer(fromAddress, toAddress, coin, ibcChannel);

                WalletClient.disconnect();

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || `Failed to ${type}`);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: `Successfully ${type === 'withdraw' ? 'withdrawn' : 'deposited'} ${amount.amount} ${normalDenom.toUpperCase()}`,
                });

                await dispatch.wallet.reloadWalletinfos(type === 'withdraw' ? fromAddress : toAddress);

                return result.hash;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to ${type}` });
                return null;
            }
        },
        async depositToPool(payload: DepositToPoolPayload, state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: `Depositing to ${DenomsUtils.getNormalDenom(payload.pool.denom)} pool...` });

            try {
                if (!lumWallet) {
                    throw new Error('No wallet connected');
                }

                const result = await LumClient.depositToPool(lumWallet.innerWallet, payload.pool, payload.amount);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || `Failed to deposit`);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: `Successfully deposited ${NumbersUtils.convertUnitNumber(payload.amount)} ${DenomsUtils.getNormalDenom(payload.pool.denom)}`,
                });

                await dispatch.wallet.reloadWalletinfos(lumWallet.address);
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to deposit to ${DenomsUtils.getNormalDenom(payload.pool.denom)} pool` });
                return null;
            }
        },
        async leavePool(payload: LeavePoolPayload, state) {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: `Leaving pool ${payload.denom.toUpperCase()} #${payload.poolId.toString()}...` });

            try {
                if (!lumWallet) {
                    throw new Error('No wallet connected');
                }

                const result = await LumClient.leavePool(lumWallet.innerWallet, payload.poolId, payload.depositId);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || '');
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: `Successfully left ${payload.denom.toUpperCase()} #${payload.poolId.toString()}`,
                });

                await dispatch.wallet.reloadWalletinfos(lumWallet.address);
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to leave pool ${payload.denom.toUpperCase()} #${payload.poolId.toString()}` });
                return null;
            }
        },
    }),
});
