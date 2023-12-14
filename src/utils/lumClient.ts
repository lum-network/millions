import { lum } from '@lum-network/sdk-javascript';
import { LumWallet, LumClient as Client, LumUtils, LumMessages } from '@lum-network/sdk-javascript-legacy';
import Long from 'long';
import { AggregatedDepositModel, DepositModel, PoolModel, PrizeModel } from 'models';
import { PoolsUtils, WalletUtils } from 'utils';
import { formatTxs } from './txs';
import { getDenomFromIbc } from './denoms';
import { ApiConstants, LumConstants } from 'constant';
import { LumApi } from 'api';
import { Draw } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/draw';
import { Withdrawal, WithdrawalState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/withdrawal';
import { QueryWithdrawalsResponse, QueryDepositsResponse } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/query';
import { DepositState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';
import { Prize } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/prize';
import { PageRequest } from '@lum-network/sdk-javascript/build/codegen/helpers';

class LumClient {
    private static instance: LumClient | null = null;
    private rpc: string = process.env.REACT_APP_RPC_LUM ?? '';
    private client: Client | null = null;
    private queryClient: Awaited<ReturnType<typeof lum.ClientFactory.createRPCQueryClient>> | null = null;
    private chainId: string | null = null;

    static get Instance() {
        if (!LumClient.instance) {
            LumClient.instance = new LumClient();
        }

        return LumClient.instance;
    }

    getChainId = () => {
        return this.chainId;
    };

    getRpc = () => {
        return this.rpc;
    };

    connect = async () => {
        if (this.client) {
            return;
        }

        try {
            const { createRPCQueryClient } = lum.ClientFactory;

            const client = await Client.connect(this.rpc);
            const queryClient = await createRPCQueryClient({ rpcEndpoint: this.rpc });

            this.client = client;
            this.queryClient = queryClient;
            this.chainId = await client.getChainId();
        } catch (e) {
            throw e as Error;
        }
    };

    getPools = async () => {
        if (this.queryClient === null) {
            return null;
        }

        const res = await this.queryClient.lum.network.millions.pools();

        return res.pools;
    };

    getPoolDraws = async (poolId: bigint) => {
        if (this.queryClient === null) {
            return null;
        }

        const draws: Draw[] = [];
        let res = await this.queryClient.lum.network.millions.poolDraws({ poolId });
        let page: Uint8Array | undefined = res.pagination?.nextKey;

        const total = Number(res.pagination?.total) || 100;

        draws.push(...res.draws);

        if (total > 100 && res.draws.length === 100) {
            for (let i = 0; i < total; i += 100) {
                res = await this.queryClient.lum.network.millions.poolDraws({ poolId });
                page = res.pagination?.nextKey;

                draws.push(...res.draws);
                if (!page || (page && !page.length)) break;
            }
        }

        draws.sort((a, b) => {
            const aHeight = Number(a.createdAtHeight);
            const bHeight = Number(b.createdAtHeight);

            return bHeight - aHeight;
        });

        if (draws.length > 100) {
            draws.splice(100, draws.length - 100);
        }

        return draws;
    };

    getPoolPrizes = async (poolId: bigint) => {
        if (this.queryClient === null) {
            return null;
        }

        const res = await this.queryClient.lum.network.millions.poolPrizes({ poolId });

        return res.prizes;
    };

    getDepositsAndWithdrawals = async (address: string): Promise<null | AggregatedDepositModel[]> => {
        if (this.queryClient === null) {
            return null;
        }

        let pageDeposits: Uint8Array | undefined = undefined;
        const deposits: DepositModel[] = [];

        while (true) {
            const resDeposits: QueryDepositsResponse = await this.queryClient.lum.network.millions.accountDeposits({
                depositorAddress: address,
                pagination: pageDeposits ? ({ key: pageDeposits } as PageRequest) : undefined,
            });

            deposits.push(...resDeposits.deposits);

            // If we have pagination key, we just patch it, and it will process in the next loop
            if (resDeposits.pagination && resDeposits.pagination.nextKey && resDeposits.pagination.nextKey.length) {
                pageDeposits = resDeposits.pagination.nextKey;
            } else {
                break;
            }
        }

        const aggregatedDeposits = await PoolsUtils.reduceDepositsByPoolId(deposits);

        let pageWithdrawals: Uint8Array | undefined = undefined;
        const withdrawals: Withdrawal[] = [];

        while (true) {
            const resWithdrawals: QueryWithdrawalsResponse = await this.queryClient.lum.network.millions.accountWithdrawals({
                depositorAddress: address,
                pagination: pageWithdrawals ? ({ key: pageWithdrawals } as PageRequest) : undefined,
            });

            withdrawals.push(...resWithdrawals.withdrawals);

            // If we have pagination key, we just patch it, and it will process in the next loop
            if (resWithdrawals.pagination && resWithdrawals.pagination.nextKey && resWithdrawals.pagination.nextKey.length) {
                pageWithdrawals = resWithdrawals.pagination.nextKey;
            } else {
                break;
            }
        }

        const withdrawalsToDeposit: Partial<DepositModel>[] = [];

        for (const withdrawal of withdrawals) {
            withdrawalsToDeposit.push({
                poolId: withdrawal.poolId,
                amount: withdrawal.amount,
                depositId: withdrawal.depositId,
                withdrawalId: withdrawal.withdrawalId,
                depositorAddress: withdrawal.depositorAddress,
                isWithdrawing: true,
                isDepositDrop: false,
                createdAt: withdrawal.createdAt,
                unbondingEndAt: withdrawal.unbondingEndsAt,
                winnerAddress: withdrawal.toAddress,
                withdrawalState: withdrawal.state,
                withdrawalCanBeRetried: withdrawal.errorState === WithdrawalState.WITHDRAWAL_STATE_IBC_TRANSFER,
            });
        }

        const aggregatedWithdrawals = await PoolsUtils.reduceDepositsByPoolId(withdrawalsToDeposit);

        const depositsDropsToDeposits: Partial<DepositModel>[] = [];

        try {
            const [depositsDrops] = await LumApi.fetchDepositsDrops(address);

            for (const drop of depositsDrops) {
                depositsDropsToDeposits.push({
                    amount: drop.amount,
                    poolId: BigInt(drop.poolId),
                    depositId: BigInt(drop.depositId),
                    depositorAddress: drop.depositorAddress,
                    isWithdrawing: false,
                    isDepositDrop: true,
                    state: DepositState.DEPOSIT_STATE_SUCCESS,
                });
            }
        } catch {}

        const aggregatedDepositsDrops = await PoolsUtils.reduceDepositsByPoolId(depositsDropsToDeposits, true);

        return [...aggregatedDeposits, ...aggregatedDepositsDrops, ...aggregatedWithdrawals];
    };

    getWalletBalances = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const balances = await this.client.getAllBalances(address);

        return { balances };
    };

    getWalletActivities = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const txs = [];
        let totalCount = 0;

        const queries = [
            // Query deposits
            `deposit.depositor='${address}' AND deposit.winner='${address}'`,

            // Query claim prize
            `prize_claim.winner='${address}'`,

            // Query leave pool
            `withdraw_deposit.depositor='${address}' AND withdraw_deposit.recipient='${address}'`,
        ];

        const res = await Promise.allSettled(queries.map((query) => this.client?.tmClient.txSearchAll({ query })));

        for (const r of res) {
            if (r.status === 'fulfilled' && r.value !== undefined) {
                txs.push(...r.value.txs);
                totalCount += r.value.totalCount;
            }
        }

        return {
            activities: await formatTxs(txs, true),
            totalCount,
        };
    };

    getWalletPrizes = async (address: string): Promise<{ prizes: Prize[] } | null> => {
        if (this.queryClient === null) {
            return null;
        }

        const prizes: Prize[] = [];
        const res = await this.queryClient.lum.network.millions.accountPrizes({ winnerAddress: address });

        for (const prize of res.prizes) {
            const amount = prize.amount ? { amount: prize.amount.amount, denom: await getDenomFromIbc(prize.amount.denom) } : undefined;

            prizes.push({
                ...prize,
                amount,
            });
        }

        return {
            prizes,
        };
    };

    getDenomTrace = async (ibcDenom: string) => {
        if (this.client === null) {
            return null;
        }

        return this.client.queryClient.ibc.transfer.denomTrace(ibcDenom);
    };

    getFeesStakers = async () => {
        if (this.client === null) {
            return null;
        }

        return Number((await this.client.queryClient.millions.params()).feesStakers) / ApiConstants.CLIENT_PRECISION;
    };

    getMinDepositDelta = async () => {
        if (this.queryClient === null) {
            return null;
        }

        const depositDelta = (await this.queryClient.lum.network.millions.params()).params?.minDepositDrawDelta?.seconds;

        if (!depositDelta) {
            return null;
        }

        return depositDelta;
    };

    depositToPool = async (wallet: LumWallet, pool: PoolModel, amount: string) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgMillionsDeposit(Long.fromNumber(Number(pool.poolId)), wallet.getAddress(), wallet.getAddress(), false, {
            amount: LumUtils.convertUnit({ amount, denom: LumConstants.LumDenom }, LumConstants.MicroLumDenom),
            denom: pool.denom,
        });

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '500000');

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, [message], this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    depositRetry = async (wallet: LumWallet, poolId: bigint, depositId: bigint) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgDepositRetry(Long.fromNumber(Number(poolId)), Long.fromNumber(Number(depositId)), wallet.getAddress());

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '500000');

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, [message], this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    multiDeposit = async (wallet: LumWallet, toDeposit: { pool: PoolModel; amount: string }[]) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const messages = [];

        for (const deposit of toDeposit) {
            messages.push(
                LumMessages.BuildMsgMillionsDeposit(Long.fromNumber(Number(deposit.pool.poolId)), wallet.getAddress(), wallet.getAddress(), false, {
                    amount: deposit.amount,
                    denom: deposit.pool.denom,
                }),
            );
        }

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '500000');

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, messages, this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    leavePool = async (wallet: LumWallet, poolId: bigint, depositId: bigint) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgWithdrawDeposit(Long.fromNumber(Number(poolId)), Long.fromNumber(Number(depositId)), wallet.getAddress(), wallet.getAddress());

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '500000');

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, [message], this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    leavePoolRetry = async (wallet: LumWallet, poolId: bigint, depositId: bigint) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgWithdrawDepositRetry(Long.fromNumber(Number(poolId)), Long.fromNumber(Number(depositId)), wallet.getAddress());

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '500000');

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, [message], this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    claimPrizes = async (wallet: LumWallet, prizes: PrizeModel[]) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const messages = [];

        for (const prize of prizes) {
            messages.push(LumMessages.BuildMsgClaimPrize(Long.fromNumber(prize.poolId), Long.fromNumber(prize.drawId), Long.fromNumber(prize.prizeId), wallet.getAddress()));
        }

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', (400000 + messages.length * 120000).toFixed(0));

        // Create the transaction document
        const doc = WalletUtils.buildTxDoc(fee, wallet, messages, this.getChainId(), await this.client.getAccount(wallet.getAddress()));

        if (!doc) {
            return null;
        }

        // Sign and broadcast the transaction using the client
        const broadcastResult = await this.client.signAndBroadcastTx(wallet, doc);

        // Verify the transaction was successfully broadcasted and made it into a block
        const broadcasted = LumUtils.broadcastTxCommitSuccess(broadcastResult);

        return {
            hash: LumUtils.toHex(broadcastResult.hash),
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };
}

export default LumClient.Instance;
