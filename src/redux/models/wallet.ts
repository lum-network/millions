import axios from 'axios';

import { Coin, LUM_DENOM, MICRO_LUM_DENOM, LUM_EXPONENT, LumBech32Prefixes } from '@lum-network/sdk-javascript';
import { createModel } from '@rematch/core';

import { LumApi } from 'api';
import { DenomsConstants, LUM_COINGECKO_ID, LUM_WALLET_LINK, WalletProvider, FirebaseConstants, ApiConstants, PrizesConstants, NavigationConstants } from 'constant';
import { LumWalletModel, OtherWalletModel, PoolModel, PrizeModel, TransactionModel, AggregatedDepositModel, LeaderboardItemModel, DepositModel } from 'models';
import { ToastUtils, I18n, LumClient, DenomsUtils, WalletClient, WalletUtils, NumbersUtils, Firebase, WalletProvidersUtils } from 'utils';
import { getMillionsDevnetKeplrConfig } from 'utils/devnet';

import { RootModel } from '.';

type SignInLumPayload = {
    address: string;
    isLedger: boolean;
};

interface IbcTransferPayload {
    fromAddress: string;
    toAddress: string;
    amount: Coin;
    type: 'withdraw' | 'deposit';
    ibcChannel: string;
    normalDenom: string;
    chainId: string;
}

interface SetWalletDataPayload {
    balances?: Coin[];
    activities?: {
        result: TransactionModel[];
        currentPage: number;
        pagesTotal: number;
    };
    deposits?: AggregatedDepositModel[];
    depositDrops?: AggregatedDepositModel[];
    prizes?: PrizeModel[];
    totalPrizesWon?: { [denom: string]: number };
}

interface GetActivitiesPayload {
    address: string;
    reset?: boolean;
}

interface SetOtherWalletPayload {
    denom: string;
    balances?: Coin[];
    address: string;
}

interface DepositToPoolPayload {
    amount: string;
    pool: PoolModel;
}

interface ClaimPrizesPayload {
    prizes: PrizeModel[];
    batchTotal: number;
    batch: number;
    limit: number;
    onBatchComplete: (batch: number) => void;
}

interface RetryDepositPayload {
    poolId: bigint;
    depositId: bigint;
}

interface DepositDropPayload {
    pool: PoolModel;
    deposits: {
        amount: string;
        winnerAddress?: string;
    }[];
    startIndex: number;
    batchCount: number;
    limit: number;
    onDepositCallback?: (batchNum: number) => void;
}

interface LeavePoolPayload {
    poolId: bigint;
    denom: string;
    depositId: bigint;
}

interface LeavePoolRetryPayload {
    poolId: bigint;
    denom: string;
    withdrawalId: bigint;
}

interface CancelDropPayload {
    pool: PoolModel;
    deposits: DepositModel[];
    startIndex: number;
    batchCount: number;
    limit: number;
    onCancelCallback?: (batchNum: number) => void;
}

interface WalletState {
    lumWallet: LumWalletModel | null;
    otherWallets: {
        [denom: string]: OtherWalletModel | undefined;
    };
    autoReloadTimestamp: number;
    prizesMutex: boolean;
}

//FIXME: When tendermint invalid string false error on cosmjs has been fixed
const isRealError = (error: Error) => {
    return error && error.message && !error.message.includes('Invalid string');
};

export const wallet = createModel<RootModel>()({
    name: 'wallet',
    state: {
        lumWallet: null,
        otherWallets: {},
        autoReloadTimestamp: 0,
        prizesMutex: false,
    } as WalletState,
    reducers: {
        signInLum(state, payload: SignInLumPayload): WalletState {
            return {
                ...state,
                lumWallet: {
                    address: payload.address,
                    balances: [],
                    activities: {
                        result: [],
                        currentPage: 1,
                        pagesTotal: 1,
                    },
                    deposits: [],
                    depositDrops: [],
                    prizes: [],
                    totalPrizesWon: {},
                    isLedger: !!payload.isLedger,
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
                        depositDrops: payload.depositDrops || state.lumWallet.depositDrops,
                        prizes: payload.prizes || state.lumWallet.prizes,
                        totalPrizesWon: payload.totalPrizesWon || state.lumWallet.totalPrizesWon,
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
        setPrizesMutex(state, payload: boolean): WalletState {
            return {
                ...state,
                prizesMutex: payload,
            };
        },
    },
    effects: (dispatch) => ({
        async connect(payload: { provider: WalletProvider; silent?: boolean }) {
            const { provider, silent = false } = payload;

            await dispatch.wallet.connectWallet({ provider, silent }).finally(() => null);
            await dispatch.wallet.connectOtherWallets(provider);
        },
        async connectWallet(payload: { provider: WalletProvider; silent: boolean }) {
            const { silent, provider } = payload;
            const providerFunctions = WalletProvidersUtils.getProviderFunctions(provider);

            if (!providerFunctions) {
                ToastUtils.showErrorToast({ content: `${provider} is not available` });
                return;
            }

            const chainId = LumClient.getChainId();
            const rpc = LumClient.getRpc();

            if (!chainId || !rpc) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.walletProvider.network', { provider }) });
                return;
            }

            try {
                await WalletProvidersUtils.suggestChain(provider, {
                    chainId: chainId,
                    chainName: rpc.includes('testnet') || chainId.includes('testnet') ? 'Lum Network [Test]' : 'Lum Network',
                    rpc,
                    rest: rpc.replace(rpc.includes('rpc') ? 'rpc' : '26657', rpc.includes('rpc') ? 'lcd' : '1317'),
                    stakeCurrency: {
                        coinDenom: LUM_DENOM,
                        coinMinimalDenom: MICRO_LUM_DENOM,
                        coinDecimals: LUM_EXPONENT,
                        coinGeckoId: LUM_COINGECKO_ID,
                    },
                    walletUrlForStaking: LUM_WALLET_LINK,
                    bip44: {
                        coinType: provider === WalletProvider.Cosmostation ? 880 : 118,
                    },
                    bech32Config: {
                        bech32PrefixAccAddr: LumBech32Prefixes.ACC_ADDR,
                        bech32PrefixAccPub: LumBech32Prefixes.ACC_PUB,
                        bech32PrefixValAddr: LumBech32Prefixes.VAL_ADDR,
                        bech32PrefixValPub: LumBech32Prefixes.VAL_PUB,
                        bech32PrefixConsAddr: LumBech32Prefixes.CONS_ADDR,
                        bech32PrefixConsPub: LumBech32Prefixes.CONS_PUB,
                    },
                    currencies: [
                        {
                            coinDenom: LUM_DENOM,
                            coinMinimalDenom: MICRO_LUM_DENOM,
                            coinDecimals: LUM_EXPONENT,
                            coinGeckoId: LUM_COINGECKO_ID,
                        },
                    ],
                    // List of coin/tokens used as a fee token in this chain.
                    feeCurrencies: [
                        {
                            coinDenom: LUM_DENOM,
                            coinMinimalDenom: MICRO_LUM_DENOM,
                            coinDecimals: LUM_EXPONENT,
                            coinGeckoId: LUM_COINGECKO_ID,
                            gasPriceStep: {
                                low: 0.01,
                                average: 0.025,
                                high: 0.04,
                            },
                        },
                    ],
                    beta: chainId.includes('testnet'),
                    features: ['ibc-transfer'],
                });
            } catch (e) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.walletProvider.networkAdd', { provider }) });
                return;
            }

            try {
                await providerFunctions.enable(chainId);

                if (provider === WalletProvider.Cosmostation) {
                    await WalletProvidersUtils.requestCosmostationAccount(chainId);
                }

                const lumOfflineSigner = await providerFunctions.getOfflineSigner(chainId);

                if (lumOfflineSigner) {
                    const accounts = await lumOfflineSigner.getAccounts();
                    const address = accounts[0].address;
                    const { isNanoLedger } = await providerFunctions.getKey(chainId);

                    await LumClient.connectSigner(lumOfflineSigner);

                    dispatch.wallet.signInLum({ address, isLedger: isNanoLedger });

                    WalletUtils.storeAutoconnectKey(provider);

                    if (location.pathname.includes(NavigationConstants.DROPS)) {
                        await dispatch.wallet.reloadWalletInfos({ address, force: true, init: true, drops: true });
                    } else {
                        await dispatch.wallet.reloadWalletInfos({ address, force: true, init: true, drops: false });
                    }

                    if (!silent) ToastUtils.showSuccessToast({ content: I18n.t('success.wallet') });

                    Firebase.signInAnonymous().finally(() => null);
                }
            } catch (e) {
                if (!silent) ToastUtils.showErrorToast({ content: I18n.t('errors.walletProvider.wallet', { provider }) });
                throw e;
            }
        },
        async connectOtherWallets(provider: WalletProvider, state) {
            const providerFunctions = WalletProvidersUtils.getProviderFunctions(provider);

            try {
                if (!providerFunctions) {
                    throw new Error(`${provider} is not available`);
                }

                for (const pool of state.pools.pools) {
                    if (!pool.internalInfos || pool.chainId.includes('lum')) {
                        continue;
                    }

                    if (pool.chainId === 'gaia-devnet') {
                        await WalletProvidersUtils.suggestChain(provider, getMillionsDevnetKeplrConfig(provider));
                    } else {
                        await providerFunctions.enable(pool.chainId);
                    }

                    const offlineSigner = await providerFunctions.getOfflineSigner(pool.chainId);
                    const accounts = await offlineSigner.getAccounts();

                    if (accounts.length > 0) {
                        const client = new WalletClient();

                        await client.connect(pool.internalInfos.rpc, offlineSigner);

                        const res = await client.getWalletBalance(accounts[0].address);

                        dispatch.wallet.setOtherWalletData({
                            address: accounts[0].address,
                            balances: res
                                ? DenomsUtils.translateIbcBalances([...res.balances], pool.transferChannelId, pool.nativeDenom).filter((balance) =>
                                      DenomsConstants.ALLOWED_DENOMS.includes(DenomsUtils.getNormalDenom(balance.denom)),
                                  )
                                : [],
                            denom: DenomsUtils.getNormalDenom(pool.nativeDenom),
                        });

                        client.disconnect();
                    }
                }
            } catch (e) {
                console.warn((e as Error).message);
            }
        },
        async reloadWalletInfos({ address, force = true, init = false, drops = false }: { address: string; force?: boolean; init?: boolean; drops?: boolean }, state) {
            if (!force && Date.now() - state.wallet.autoReloadTimestamp < 1000 * 60 * 30) {
                return;
            }

            dispatch.wallet.setAutoReloadTimestamp(Date.now());

            if (!drops) {
                await dispatch.stats.fetchStats();
            }

            if (!init) {
                await dispatch.pools.fetchPools(null);
                await dispatch.pools.getPoolsAdditionalInfo(null);
            } else {
                await dispatch.wallet.getLumWalletBalances(null);
            }

            await dispatch.wallet.getActivities({ address, reset: true });

            if (!drops) {
                await dispatch.wallet.fetchPrizes(address);
                await dispatch.wallet.getDepositsAndWithdrawals(address);
            } else {
                await dispatch.wallet.getDepositsAndWithdrawalsDrops(address);
            }
        },
        async reloadOtherWalletInfo(_, state) {
            const otherWallets = state.wallet.otherWallets;

            const poolsChainIds = state.pools.pools.reduce<string[]>((acc, pool) => {
                if (!acc.includes(pool.chainId) && !pool.chainId.includes('lum')) {
                    acc.push(pool.chainId);
                }
                return acc;
            }, []);

            for (const chainId of poolsChainIds) {
                const pool = state.pools.pools.find((pool) => pool.chainId === chainId);
                if (!pool) {
                    continue;
                }

                if (pool.internalInfos === undefined) {
                    continue;
                }

                const poolNativeDenom = DenomsUtils.getNormalDenom(pool.nativeDenom);
                const wallet = otherWallets[poolNativeDenom];

                if (!wallet) {
                    continue;
                }

                const client = new WalletClient();

                await client.connect(pool.internalInfos.rpc);

                const res = await client.getWalletBalance(wallet.address);

                dispatch.wallet.setOtherWalletData({
                    address: wallet.address,
                    balances: res
                        ? DenomsUtils.translateIbcBalances([...res.balances], pool.transferChannelId, pool.nativeDenom).filter(
                              (balance) => state.pools.pools.find((pool) => pool.nativeDenom === balance.denom) || balance.denom === MICRO_LUM_DENOM,
                          )
                        : [],
                    denom: poolNativeDenom,
                });

                client.disconnect();
            }
        },
        async getLumWalletBalances(_, state): Promise<Coin[] | undefined> {
            if (!state.wallet.lumWallet) {
                return undefined;
            }

            try {
                const result = await LumClient.getWalletBalances(state.wallet.lumWallet.address);

                if (result) {
                    const balances = await DenomsUtils.translateLumIbcBalances([...result.balances]);
                    const filteredBalances = balances.filter((balance) => state.pools.pools.find((pool) => pool.nativeDenom === balance.denom) || balance.denom === MICRO_LUM_DENOM);

                    dispatch.wallet.setLumWalletData({ balances: filteredBalances });

                    return filteredBalances;
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async getActivities(payload: GetActivitiesPayload, state) {
            try {
                const res = await LumClient.getWalletActivities(payload.address);

                if (res) {
                    const txs = [...(payload.reset ? [] : state.wallet.lumWallet?.activities.result || []), ...res.activities];

                    const pagesTotal = res.totalCount ? Math.ceil(res.totalCount / 5) : state.wallet.lumWallet?.activities.pagesTotal || 0;

                    dispatch.wallet.setLumWalletData({
                        activities: {
                            result: txs,
                            pagesTotal,
                            currentPage: 1,
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
        async fetchPrizes(address: string, state) {
            if (state.wallet.prizesMutex) {
                return;
            }

            dispatch.wallet.setPrizesMutex(true);

            try {
                const prizesToClaim = await LumClient.getWalletPrizes(address);
                let prizesToClaimSorted: PrizeModel[] = [];

                if (prizesToClaim) {
                    prizesToClaimSorted = prizesToClaim.prizes
                        .sort((a, b) => {
                            const aAmount = NumbersUtils.convertUnitNumber(a.amount?.amount || '0', a.amount?.denom);
                            const bAmount = NumbersUtils.convertUnitNumber(b.amount?.amount || '0', b.amount?.denom);

                            return bAmount - aAmount;
                        })
                        .map((prize) => ({
                            ...prize,
                            drawId: Number(prize.drawId),
                            poolId: Number(prize.poolId),
                            prizeId: Number(prize.prizeId),
                            createdAtHeight: Number(prize.createdAtHeight),
                            updatedAtHeight: Number(prize.updatedAtHeight),
                            amount: {
                                amount: Number(prize.amount?.amount || '0'),
                                denom: prize.amount?.denom ?? '',
                            },
                            id: `${prize.poolId}-${prize.drawId}-${prize.prizeId}`,
                            state: PrizesConstants.PrizeState.PENDING,
                        }));

                    dispatch.wallet.setLumWalletData({
                        prizes: prizesToClaimSorted,
                    });
                }

                const [prizesHistory] = await LumApi.fetchPrizesByAddress(address);

                for (const historyPrize of prizesHistory) {
                    const prize = prizesToClaimSorted.find((prize) => prize.id === historyPrize.id);

                    if (!prize) {
                        prizesToClaimSorted.push({
                            ...historyPrize,
                            // FIXME
                            // state: dayjs(historyPrize.expiresAt).isBefore(dayjs()) ? PrizesConstants.PrizeState.EXPIRED : PrizesConstants.PrizeState.CLAIMED,
                            state: PrizesConstants.PrizeState.CLAIMED,
                        });
                    }
                }

                const totalPrizesWon: { [denom: string]: number } = {};

                for (const prize of prizesToClaimSorted) {
                    if (prize.state !== PrizesConstants.PrizeState.CLAIMED) {
                        continue;
                    }

                    if (totalPrizesWon[prize.amount.denom]) {
                        totalPrizesWon[prize.amount.denom] += NumbersUtils.convertUnitNumber(prize.amount.amount, prize.amount.denom);
                    } else {
                        totalPrizesWon[prize.amount.denom] = NumbersUtils.convertUnitNumber(prize.amount.amount, prize.amount.denom);
                    }
                }

                dispatch.wallet.setLumWalletData({
                    prizes: prizesToClaimSorted,
                    totalPrizesWon,
                });
            } catch (e) {
                console.warn(e);
            } finally {
                dispatch.wallet.setPrizesMutex(false);
            }
        },
        async getLeaderboardRank(poolId: bigint, state): Promise<LeaderboardItemModel[] | null | undefined> {
            if (!state.wallet.lumWallet) {
                return null;
            }

            try {
                const [res] = await LumApi.fetchLeaderboardUserRank(poolId.toString(), state.wallet.lumWallet.address);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async ibcTransfer(payload: IbcTransferPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { toAddress, fromAddress, amount, normalDenom, type, ibcChannel, chainId } = payload;

            const convertedAmount = NumbersUtils.convertUnitNumber(amount.amount, normalDenom, false).toFixed();

            const coin = {
                amount: convertedAmount,
                denom: amount.denom,
            };

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.ibcTransfer') });

            try {
                if (!chainId) {
                    throw new Error(I18n.t('errors.client.chainId', { denom: normalDenom.toUpperCase() }));
                }
                const provider = WalletUtils.getAutoconnectProvider();

                if (provider === null) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                const providerFunctions = WalletProvidersUtils.getProviderFunctions(provider);

                if (!providerFunctions) {
                    throw new Error(`${provider} is not available`);
                }

                const offlineSigner = await providerFunctions.getOfflineSigner(chainId);

                const rpc = type === 'withdraw' ? LumClient.getRpc() : state.pools.pools.find((pool) => pool.chainId === chainId)?.internalInfos?.rpc;

                if (!rpc) {
                    throw new Error(I18n.t('errors.client.unavailableRpc', { denom: normalDenom.toUpperCase() }));
                }

                const client = new WalletClient();

                await client.connect(rpc, offlineSigner, true);

                let result = null;

                try {
                    result = await client.ibcTransfer(fromAddress, toAddress, coin, ibcChannel, type === 'withdraw' ? MICRO_LUM_DENOM : 'u' + normalDenom);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

                client.disconnect();

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                let balanceUpdated = false;

                for (let ticks = 0; ticks < 6; ticks++) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 10000);
                    });

                    const newBalances = await dispatch.wallet.getLumWalletBalances(null);
                    const res = WalletUtils.updatedBalances([...(state.wallet.lumWallet?.balances ?? [])], newBalances);

                    if (res) {
                        balanceUpdated = res;
                    }
                }

                if (!chainId.includes('testnet') && !chainId.includes('devnet') && type === 'deposit') {
                    // Bot API call to send lum via faucet
                    try {
                        await axios.post(`${ApiConstants.BOT_API_URL}/faucet`, {
                            address: toAddress,
                        });
                    } catch (e) {
                        console.warn(e);
                    }
                }

                if (!balanceUpdated) {
                    ToastUtils.updateLoadingToast(
                        toastId,
                        'warning',
                        {
                            content: I18n.t('warning.ibcTransfer', { link: `${NavigationConstants.MINTSCAN}/${chainId.split('-')[0]}/tx/${result.hash}` }),
                        },
                        false,
                        {
                            closeButton: true,
                        },
                    );
                } else {
                    ToastUtils.updateLoadingToast(toastId, 'success', {
                        content: I18n.t('success.ibcTransfer', { amount: amount.amount, denom: normalDenom.toUpperCase(), chain: type === 'withdraw' ? 'native chain' : 'Lum Network' }),
                    });
                }

                dispatch.wallet.reloadWalletInfos({ address: type === 'withdraw' ? fromAddress : toAddress, force: true });
                dispatch.wallet.reloadOtherWalletInfo(null);

                return result;
            } catch (e) {
                console.error(e);
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || I18n.t('errors.ibcTransfer') });
                return null;
            }
        },
        async depositToPool(payload: DepositToPoolPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.deposit', { denom: DenomsUtils.getNormalDenom(payload.pool.nativeDenom).toUpperCase() }) });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                try {
                    result = await LumClient.depositToPool(lumWallet, payload.pool, payload.amount);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

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
        async retryDeposit(payload: RetryDepositPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: `Retrying deposit #${payload.depositId.toString()} to pool #${payload.poolId.toString()}` });

            try {
                if (!lumWallet) {
                    throw new Error('errors.client.noWalletConnected');
                }

                let result = null;

                try {
                    result = await LumClient.depositRetry(lumWallet, payload.poolId, payload.depositId);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: `Successfully retried deposit #${payload.depositId.toString()} to pool #${payload.poolId.toString()}`,
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || `Failed to retry deposit #${payload.depositId.toString()}` });
                return null;
            }
        },
        async leavePool(payload: LeavePoolPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.leavePool', { denom: payload.denom.toUpperCase(), poolId: payload.poolId.toString() }) });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                try {
                    result = await LumClient.leavePool(lumWallet, payload.poolId, payload.depositId);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.leavePool', { denom: payload.denom.toUpperCase(), poolId: payload.poolId.toString() }),
                });

                Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEAVE_POOL_SUCCESS, {
                    pool_id: payload.poolId?.toString(),
                    deposit_id: payload.depositId?.toString(),
                    denom: payload.denom,
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
        async leavePoolRetry(payload: LeavePoolRetryPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t('pending.withdrawalRetry', { withdrawalId: payload.withdrawalId.toString(), poolId: payload.poolId.toString() }) });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                try {
                    result = await LumClient.leavePoolRetry(lumWallet, payload.poolId, payload.withdrawalId);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.withdrawalRetry', { withdrawalId: payload.withdrawalId.toString(), poolId: payload.poolId.toString() }),
                });

                Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEAVE_POOL_RETRY_SUCCESS, {
                    pool_id: payload.poolId.toString(),
                    deposit_id: payload.withdrawalId.toString(),
                    denom: payload.denom,
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.withdrawalRetry', { withdrawalId: payload.withdrawalId.toString(), poolId: payload.poolId.toString() }),
                });
                return null;
            }
        },
        async claimPrizes(payload: ClaimPrizesPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;

            const { prizes, batch, batchTotal, onBatchComplete } = payload;

            let prizesToClaim = [...prizes];

            const toastId = ToastUtils.showLoadingToast({ content: I18n.t(batchTotal > 1 ? 'pending.claimPrize' : 'pending.claimPrize', { count: 1, total: batchTotal }) });

            let lastBatch = 0;

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                for (let i = batch; i < batchTotal; i++) {
                    lastBatch = i;

                    if (i > 0) {
                        ToastUtils.updateToastContent(toastId, {
                            content: I18n.t('pending.claimPrizeBatch', { count: i + 1, total: batchTotal }),
                        });
                    }

                    const toClaim = prizesToClaim.slice(0, payload.limit);

                    try {
                        result = await LumClient.claimPrizes(lumWallet, toClaim);
                    } catch (e) {
                        const error = e as Error;
                        if (isRealError(error)) {
                            throw error;
                        }
                    }

                    if (!result || (result && result.error)) {
                        throw new Error(result?.error || undefined);
                    }

                    const newPrizes = prizesToClaim.slice(toClaim.length);
                    prizesToClaim = [...newPrizes];

                    dispatch.wallet.setLumWalletData({
                        prizes: [...newPrizes],
                    });
                    onBatchComplete(i + 1);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t('success.claimPrize'),
                });
                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true });
                return result;
            } catch (e) {
                onBatchComplete(lastBatch);
                ToastUtils.updateLoadingToast(toastId, 'error', { content: (e as Error).message || I18n.t('errors.claimPrize') });
                return null;
            }
        },
        async claimAndCompoundPrizes(payload: ClaimPrizesPayload, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { prizes } = payload;
            const claimRes = await dispatch.wallet.claimPrizes(payload);

            if (!claimRes || (claimRes && claimRes.error)) {
                return null;
            }

            const toDeposit: {
                amount: string;
                pool: PoolModel;
            }[] = [];

            for (const prize of prizes) {
                if (!prize.amount) continue;

                const existingItemIndex = toDeposit.findIndex((d) => Number(d.pool.poolId) === Number(prize.poolId));
                if (existingItemIndex === -1) {
                    const pool = state.pools.pools.find((p) => Number(p.poolId) === Number(prize.poolId));

                    if (!pool) continue;

                    toDeposit.push({
                        amount: prize.amount.amount.toPrecision(),
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

                let result = null;

                try {
                    result = await LumClient.multiDeposit(lumWallet, toDeposit);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

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

        // DROPS
        async getDepositsAndWithdrawalsDrops(address: string) {
            try {
                const res = await LumClient.getDepositsAndWithdrawalsDrops(address);

                if (res) {
                    dispatch.wallet.setLumWalletData({ depositDrops: res });
                }
            } catch (e) {
                console.warn(e);
            }
        },
        async depositDrop(payload: DepositDropPayload, state) {
            const { lumWallet } = state.wallet;
            const { pool, startIndex, deposits, onDepositCallback, batchCount, limit } = payload;

            let lastBatch = startIndex;

            const toastId = ToastUtils.showLoadingToast({
                content: I18n.t(batchCount === 1 ? 'pending.deposit' : 'pending.multiDeposit', { index: 1, count: batchCount, denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase() }),
            });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                for (let i = startIndex; i < batchCount; i++) {
                    lastBatch = i;

                    if (i > 0) {
                        ToastUtils.updateToastContent(toastId, { content: I18n.t('pending.multiDeposit', { index: i + 1, count: batchCount }) });
                    }

                    const toDeposit = deposits.slice(i * limit, (i + 1) * limit).map((d) => ({ ...d, pool }));

                    try {
                        result = await LumClient.multiDeposit(lumWallet, toDeposit);
                    } catch (e) {
                        const error = e as Error;
                        if (isRealError(error)) {
                            throw error;
                        }
                    }

                    if (!result || (result && result.error)) {
                        throw new Error(result?.error || undefined);
                    } else {
                        onDepositCallback?.(i + 1);
                    }
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t(batchCount === 1 ? 'success.deposit' : 'success.multiDeposit', {
                        count: batchCount,
                        denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase(),
                        amount: deposits.reduce((acc, deposit) => acc + NumbersUtils.convertUnitNumber(deposit.amount, pool.nativeDenom), 0),
                    }),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true, drops: true });
                return true;
            } catch (e) {
                onDepositCallback?.(lastBatch);
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.deposit.generic', { denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase() }),
                });
                return null;
            }
        },
        async cancelDrop(payload: CancelDropPayload, state) {
            const { lumWallet } = state.wallet;
            const { pool, startIndex, deposits, batchCount, limit, onCancelCallback } = payload;

            let lastBatch = startIndex;

            const toastId = ToastUtils.showLoadingToast({
                content: I18n.t(batchCount === 1 ? 'pending.cancelDrop' : 'pending.cancelDropMulti', {
                    index: 1,
                    count: batchCount,
                    denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase(),
                }),
            });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                for (let i = startIndex; i < batchCount; i++) {
                    lastBatch = i;

                    if (i > 0) {
                        ToastUtils.updateToastContent(toastId, { content: I18n.t('pending.cancelDropMulti', { index: i + 1, count: batchCount }) });
                    }

                    const toCancel = deposits.slice(i * limit, (i + 1) * limit);

                    try {
                        result = await LumClient.cancelDepositDrop(lumWallet, toCancel);
                    } catch (e) {
                        const error = e as Error;
                        if (isRealError(error)) {
                            throw error;
                        }
                    }

                    if (!result || (result && result.error)) {
                        throw new Error(result?.error || undefined);
                    } else {
                        onCancelCallback?.(i + 1);
                    }
                }

                ToastUtils.updateLoadingToast(toastId, 'success', {
                    content: I18n.t(batchCount === 1 ? 'success.cancelDrop' : 'success.cancelDropMulti', { count: batchCount, denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase() }),
                });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true, drops: true });
                return true;
            } catch (e) {
                onCancelCallback?.(lastBatch);
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.deposit.generic', { denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase() }),
                });
                return null;
            }
        },
        async editDrop(payload: { pool: PoolModel; deposit: DepositModel; newWinnerAddress: string }, state): Promise<{ hash: string; error: string | null | undefined } | null> {
            const { lumWallet } = state.wallet;
            const { pool, deposit, newWinnerAddress } = payload;

            const toastId = ToastUtils.showLoadingToast({
                content: I18n.t('pending.editDrop'),
            });

            try {
                if (!lumWallet) {
                    throw new Error(I18n.t('errors.client.noWalletConnected'));
                }

                let result = null;

                try {
                    result = await LumClient.editDeposit(lumWallet, deposit, newWinnerAddress);
                } catch (e) {
                    const error = e as Error;
                    if (isRealError(error)) {
                        throw error;
                    }
                }

                if (!result || (result && result.error)) {
                    throw new Error(result?.error || undefined);
                }

                ToastUtils.updateLoadingToast(toastId, 'success', { content: I18n.t('success.editDrop') });

                dispatch.wallet.reloadWalletInfos({ address: lumWallet.address, force: true, drops: true });
                return result;
            } catch (e) {
                ToastUtils.updateLoadingToast(toastId, 'error', {
                    content: (e as Error).message || I18n.t('errors.deposit.generic', { denom: DenomsUtils.getNormalDenom(pool.nativeDenom).toUpperCase() }),
                });
                return null;
            }
        },
    }),
});
