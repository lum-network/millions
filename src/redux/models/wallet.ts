import { createModel } from '@rematch/core';
import { LumConstants, LumTypes, LumUtils, LumWallet, LumWalletFactory } from '@lum-network/sdk-javascript';
import { Prize, PrizeState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { Window as KeplrWindow } from '@keplr-wallet/types';
import Long from 'long';

import { ToastUtils, I18n, LumClient, DenomsUtils, WalletClient, KeplrUtils, WalletUtils, NumbersUtils } from 'utils';
import { DenomsConstants, LUM_COINGECKO_ID, LUM_WALLET_LINK, WalletProvider } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel, TransactionModel, AggregatedDepositModel } from 'models';
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
    activities?: {
        result: TransactionModel[];
        currentPage: number;
        pagesTotal: number;
        pagesLoaded: number;
    };
    deposits?: AggregatedDepositModel[];
    prizes?: Prize[];
}

interface GetActivitiesPayload {
    address: string;
    page?: number;
    prevTxs?: TransactionModel[];
    reset?: boolean;
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

interface RetryDepositPayload {
    poolId: Long;
    depositId: Long;
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
    autoReloadTimestamp: number;
}

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        lumWallet: null,
        otherWallets: {},
        autoReloadTimestamp: 0,
    } as WalletState,
    reducers: {
        signInLum(state, payload: LumWallet): WalletState {
            return {
                ...state,
                lumWallet: {
                    innerWallet: payload,
                    address: payload.getAddress(),
                    balances: [],
                    activities: {
                        result: [],
                        currentPage: 1,
                        pagesTotal: 1,
                        pagesLoaded: 1,
                    },
                    deposits: [],
                    prizes: [],
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
                        deposits: payload.deposits || state.lumWallet.deposits,
                        prizes: payload.prizes || state.lumWallet.prizes,
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
        setActivitiesPage(state, payload: number): WalletState {
            return {
                ...state,
                ...(state.lumWallet && {
                    lumWallet: {
                        ...state.lumWallet,
                        activities: {
                            ...state.lumWallet.activities,
                            currentPage: payload,
                        },
                    },
                }),
            };
        },
        setAutoReloadTimestamp(state, payload: number): WalletState {
            return {
                ...state,
                autoReloadTimestamp: payload,
            };
        },
    },
    effects: (dispatch) => ({
        async connectWallet(payload: { provider: WalletProvider; silent: boolean } /* state */) {
            const { silent, provider } = payload;
            const walletProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            if (!walletProvider) {
                ToastUtils.showErrorToast({ content: `${provider} is not available` });
                return;
            }

            if (!walletProvider.getOfflineSigner) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.notInstalled') });
            } else if (!walletProvider.experimentalSuggestChain) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.notLatest') });
            } else {
                const chainId = LumClient.getChainId();
                const rpc = LumClient.getRpc();

                if (!chainId || !rpc) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.network') });
                    return;
                }

                try {
                    await walletProvider.experimentalSuggestChain({
                        chainId: chainId,
                        chainName: rpc.includes('testnet') || chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                        rpc,
                        rest: rpc.replace(rpc.includes('/rpc') ? '/rpc' : '26657', rpc.includes('/rpc') ? '/rest' : '1317'),
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
                    await walletProvider.enable([/* ...state.pools.pools.map((pool) => pool.chainId),  */ chainId]);
                    if (!walletProvider.getOfflineSignerAuto) {
                        throw new Error(I18n.t('errors.keplr.offlineSigner'));
                    }
                    const lumOfflineSigner = await walletProvider.getOfflineSignerAuto(chainId);
                    const lumWallet = await LumWalletFactory.fromOfflineSigner(lumOfflineSigner);
                    if (lumWallet) {
                        dispatch.wallet.signInLum(lumWallet);

                        WalletUtils.storeAutoconnectKey(provider);

                        await dispatch.wallet.reloadWalletInfos({ address: lumWallet.getAddress(), force: true });
                        if (!silent) ToastUtils.showSuccessToast({ content: I18n.t('success.wallet') });
                    }
                } catch (e) {
                    if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.keplr.wallet') });
                    throw e;
                }
            }
        },
        async connectOtherWallets(provider: WalletProvider, state) {
            const walletProvider = provider === WalletProvider.Keplr ? window.keplr : window.leap;

            try {
                if (!walletProvider) {
                    throw new Error(`${provider} is not available`);
                }

                for (const pool of state.pools.pools) {
                    if (!pool.internalInfos || pool.chainId.includes('lum')) {
                        continue;
                    }

                    if (pool.chainId === 'gaia-devnet') {
                        await KeplrUtils.enableKeplrWithInfos({
                            bech32Config: {
                                bech32PrefixAccAddr: 'cosmos',
                                bech32PrefixAccPub: 'cosmospub',
                                bech32PrefixConsAddr: 'cosmosvalcons',
                                bech32PrefixConsPub: 'cosmosvalconspub',
                                bech32PrefixValAddr: 'cosmosvaloper',
                                bech32PrefixValPub: 'cosmosvaloperpub',
                            },
                            bip44: {
                                coinType: 118,
                            },
                            chainId: 'gaia-devnet',
                            chainName: 'Cosmos Hub [Test Millions]',
                            chainSymbolImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/chain.png',
                            currencies: [
                                {
                                    coinDecimals: 6,
                                    coinDenom: 'ATOM',
                                    coinGeckoId: 'cosmos',
                                    coinMinimalDenom: 'uatom',
                                },
                            ],
                            features: [],
                            feeCurrencies: [
                                {
                                    coinDecimals: 6,
                                    coinDenom: 'ATOM',
                                    coinGeckoId: 'cosmos',
                                    coinMinimalDenom: 'uatom',
                                    gasPriceStep: {
                                        average: 0.025,
                                        high: 0.03,
                                        low: 0.01,
                                    },
                                },
                            ],
                            rest: 'https://testnet-rpc.cosmosmillions.com/atom/rest',
                            rpc: 'https://testnet-rpc.cosmosmillions.com/atom/rpc',
                            stakeCurrency: {
                                coinDecimals: 6,
                                coinDenom: 'ATOM',
                                coinGeckoId: 'cosmos',
                                coinMinimalDenom: 'uatom',
                            },
                        });
                    }
                    const offlineSigner = await walletProvider.getOfflineSignerAuto(pool.chainId);
                    const accounts = await offlineSigner.getAccounts();

                    if (accounts.length > 0) {
                        await WalletClient.connect(pool.internalInfos.rpc, offlineSigner);

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
                }
            } catch (e) {
                console.warn((e as Error).message);
            }
        },
        async reloadWalletInfos({ address, force = true }: { address: string; force?: boolean }, state) {
            if (!force && Date.now() - state.wallet.autoReloadTimestamp < 1000 * 60 * 3) {
                return;
            }

            dispatch.wallet.setAutoReloadTimestamp(Date.now());

            await dispatch.pools.fetchPools();
            await dispatch.pools.getPoolsAdditionalInfo(null);
            await dispatch.wallet.getLumWalletBalances(address);
            await dispatch.wallet.getPrizes(address);
            await dispatch.wallet.getActivities({ address, reset: true });
            await dispatch.wallet.getDepositsAndWithdrawals(address);
        },
        async getLumWalletBalances(address: string, state): Promise<LumTypes.Coin[] | undefined> {
            try {
                const result = await LumClient.getWalletBalances(address);

                if (result) {
                    const balances = await DenomsUtils.translateLumIbcBalances([...result.balances]);
                    const filteredBalances = balances.filter((balance) => state.pools.pools.find((pool) => pool.nativeDenom === balance.denom) || balance.denom === LumConstants.MicroLumDenom);

                    dispatch.wallet.setLumWalletData({ balances: filteredBalances });

                    return filteredBalances;
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async getActivities(payload: GetActivitiesPayload, state) {
            try {
                const res = await LumClient.getWalletActivities(payload.address, payload.page);
                const currPagesLoaded = state.wallet.lumWallet?.activities.pagesLoaded || 1;

                if (res) {
                    const txs = [...(payload.reset ? [] : state.wallet.lumWallet?.activities.result || []), ...res.activities];

                    const pagesTotal = res.totalCount ? Math.ceil(res.totalCount / 30) : state.wallet.lumWallet?.activities.pagesTotal || 0;

                    dispatch.wallet.setLumWalletData({
                        activities: {
                            result: txs,
                            currentPage: res.currentPage,
                            pagesTotal,
                            pagesLoaded: payload.reset ? 1 : res.currentPage > currPagesLoaded ? res.currentPage : currPagesLoaded,
                        },
                    });
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async getDepositsAndWithdrawals(address: string) {
            try {
                const res = await LumClient.getDepositsAndWithdrawals(address);

                if (res) {
                    dispatch.wallet.setLumWalletData({ deposits: res });
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async getPrizes(address: string) {
            try {
                const res = await LumClient.getWalletPrizes(address);

                if (res) {
                    dispatch.wallet.setLumWalletData({
                        prizes: res.prizes
                            .filter((prize) => prize.state === PrizeState.PRIZE_STATE_PENDING)
                            .sort((a, b) => {
                                const aAmount = NumbersUtils.convertUnitNumber(a.amount?.amount || '0');
                                const bAmount = NumbersUtils.convertUnitNumber(b.amount?.amount || '0');

                                return bAmount - aAmount;
                            }),
                    });
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async ibcTransfer(payload: IbcTransferPayload, state): Promise<{ hash: string; error: string | undefined } | null> {
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

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.ibcTransfer') });

            try {
                if (!chainId) {
                    throw new Error(I18n.t('errors.client.chainId', { denom: normalDenom.toUpperCase() }));
                }

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const offlineSigner = await (window as KeplrWindow).getOfflineSignerAuto!(chainId);

                const rpc = type === 'withdraw' ? LumClient.getRpc() : state.pools.pools.find((pool) => pool.chainId === chainId)?.internalInfos?.rpc;

                if (!rpc) {
                    throw new Error(I18n.t('errors.client.unavailableRpc', { denom: normalDenom.toUpperCase() }));
                }

                await WalletClient.connect(rpc, offlineSigner);

                const result = await WalletClient.ibcTransfer(fromAddress, toAddress, coin, ibcChannel);

                WalletClient.disconnect();

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                while (true) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 10000);
                    });

                    const newBalances = await dispatch.wallet.getLumWalletBalances(type === 'withdraw' ? fromAddress : toAddress);

                    if (WalletUtils.updatedBalances(state.wallet.lumWallet?.balances, newBalances)) {
                        break;
                    }
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.ibcTransfer', { amount: amount.amount, denom: normalDenom.toUpperCase(), chain: type === 'withdraw' ? 'native chain' : 'Lum Network' }),
                });

                dispatch.wallet.reloadWalletInfos({ address: type === 'withdraw' ? fromAddress : toAddress, force: true });

                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || I18n.t('errors.ibcTransfer') });
                return null;
            }
        },
        async depositToPool(payload: DepositToPoolPayload, state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.deposit', { denom: DenomsUtils.getNormalDenom(payload.pool.nativeDenom).toUpperCase() }) });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                const result = await LumClient.depositToPool(lumWallet.innerWallet, payload.pool, payload.amount);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.deposit', { amount: payload.amount, denom: DenomsUtils.getNormalDenom(payload.pool.nativeDenom).toUpperCase() }),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.deposit.generic', { denom: DenomsUtils.getNormalDenom(payload.pool.nativeDenom).toUpperCase() }),
                });
                return null;
            }
        },
        async retryDeposit(payload: RetryDepositPayload, state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: `Retrying deposit #${payload.depositId.toNumber()} to pool #${payload.poolId.toNumber()}` });

            try {
                if (!lumWallet) {
                    throw new Error('No wallet connected');
                }

                const result = await LumClient.depositRetry(lumWallet.innerWallet, payload.poolId, payload.depositId);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || `Failed to retry deposit #${payload.depositId.toNumber()}`);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: `Successfully retried deposit #${payload.depositId.toNumber()} to pool #${payload.depositId.toNumber()}`,
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to retry deposit #${payload.depositId.toNumber()}` });
                return null;
            }
        },
        async leavePool(payload: LeavePoolPayload, state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.leavePool', { denom: payload.denom.toUpperCase(), poolId: payload.poolId.toString() }) });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                const result = await LumClient.leavePool(lumWallet.innerWallet, payload.poolId, payload.depositId);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.leavePool', { denom: payload.denom.toUpperCase(), poolId: payload.poolId.toString() }),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.leavePool', { denom: payload.denom.toUpperCase(), poolId: payload.poolId.toString() }),
                });
                return null;
            }
        },
        async claimPrizes(payload: Prize[], state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.claimPrize') });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                const result = await LumClient.claimPrizes(lumWallet.innerWallet, payload);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.claimPrize'),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || I18n.t('errors.claimPrize') });
                return null;
            }
        },
        async claimAndCompoundPrizes(payload: Prize[], state): Promise<{ hash: Uint8Array; error: string | null | undefined } | null> {
            const claimRes = await dispatch.wallet.claimPrizes(payload);

            if (!claimRes || (claimRes && claimRes.error)) {
                return null;
            }

            const toDeposit: {
                amount: string;
                pool: PoolModel;
            }[] = [];

            for (const prize of payload) {
                if (!prize.amount) continue;

                const existingItemIndex = toDeposit.findIndex((d) => d.pool.poolId.equals(prize.poolId));
                if (existingItemIndex === -1) {
                    const pool = state.pools.pools.find((p) => p.poolId.equals(prize.poolId));

                    if (!pool) continue;

                    toDeposit.push({
                        amount: prize.amount.amount,
                        pool,
                    });
                } else {
                    toDeposit[existingItemIndex].amount = (Number(toDeposit[existingItemIndex].amount) + Number(prize.amount.amount)).toFixed();
                }
            }

            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.claimAndCompound') });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                const result = await LumClient.multiDeposit(lumWallet.innerWallet, toDeposit);

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.claimAndCompound'),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || I18n.t('errors.claimAndCompound') });
                return null;
            }
        },
    }),
});
