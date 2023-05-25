import { LumClient as Client, LumConstants, LumMessages, LumUtils, LumWallet } from '@lum-network/sdk-javascript';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { Draw } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/draw';
import Long from 'long';
import { AggregatedDepositModel, DepositModel, PoolModel } from 'models';
import { PoolsUtils, WalletUtils } from 'utils';
import { formatTxs } from './txs';
import { getDenomFromIbc } from './denoms';
import { ApiConstants } from 'constant';

class LumClient {
    private static instance: LumClient | null = null;
    private rpc: string = process.env.REACT_APP_RPC_LUM ?? '';
    private client: Client | null = null;
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
            const client = await Client.connect(this.rpc);
            this.client = client;
            this.chainId = await client.getChainId();
        } catch (e) {
            throw e as Error;
        }
    };

    getPools = async () => {
        if (this.client === null) {
            return null;
        }

        const res = await this.client.queryClient.millions.pools();

        return res.pools;
    };

    getPoolDraws = async (poolId: Long) => {
        if (this.client === null) {
            return null;
        }

        const draws: Draw[] = [];
        let res = await this.client.queryClient.millions.poolDraws(poolId);
        let page: Uint8Array | undefined = res.pagination?.nextKey;

        const total = res.pagination?.total.toNumber() || 100;

        draws.push(...res.draws);

        if (total > 100 && res.draws.length === 100) {
            for (let i = 0; i < total; i += 100) {
                res = await this.client.queryClient.millions.poolDraws(poolId, page);
                page = res.pagination?.nextKey;

                draws.push(...res.draws);
                if (!page || (page && !page.length)) break;
            }
        }

        draws.sort((a, b) => {
            const aHeight = a.createdAtHeight.toNumber();
            const bHeight = b.createdAtHeight.toNumber();

            return bHeight - aHeight;
        });

        if (draws.length > 100) {
            draws.splice(100, draws.length - 100);
        }

        return draws;
    };

    getPoolPrizes = async (poolId: Long) => {
        if (this.client === null) {
            return null;
        }

        const res = await this.client.queryClient.millions.poolPrizes(poolId);

        return res.prizes;
    };

    getDepositsAndWithdrawals = async (address: string): Promise<null | AggregatedDepositModel[]> => {
        if (this.client === null) {
            return null;
        }

        const resDeposits = await this.client.queryClient.millions.accountDeposits(address);

        const aggregatedDeposits = await PoolsUtils.reduceDepositsByPoolId(resDeposits.deposits);

        const resWithdrawals = await this.client.queryClient.millions.accountWithdrawals(address);

        const withdrawalsToDeposit: Partial<DepositModel>[] = [];

        for (const withdrawal of resWithdrawals.withdrawals) {
            withdrawalsToDeposit.push({
                poolId: withdrawal.poolId,
                amount: withdrawal.amount,
                depositId: withdrawal.withdrawalId,
                depositorAddress: withdrawal.depositorAddress,
                isWithdrawing: true,
                createdAt: withdrawal.createdAt,
                unbondingEndAt: withdrawal.unbondingEndsAt,
            });
        }

        const aggregatedWithdrawals = await PoolsUtils.reduceDepositsByPoolId(withdrawalsToDeposit);

        return [...aggregatedDeposits, ...aggregatedWithdrawals];
    };

    getWalletBalances = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const balances = await this.client.getAllBalances(address);

        return { balances };
    };

    getWalletActivities = async (address: string, page = 1) => {
        if (this.client === null) {
            return null;
        }

        const LIMIT = 30;

        let totalCount: number | null = null;

        const query = LumUtils.searchTxByTags([
            { key: 'message.module', value: 'millions' },
            { key: 'transfer.sender', value: address },
        ]);

        const res = await this.client.tmClient.txSearch({ query, page, per_page: LIMIT, order_by: 'desc' });

        if (page === 1) {
            totalCount = res.totalCount;
        }

        return {
            activities: await formatTxs(res.txs, true),
            totalCount,
            currentPage: page,
        };
    };

    getWalletPrizes = async (address: string): Promise<{ prizes: Prize[] } | null> => {
        if (this.client === null) {
            return null;
        }

        const prizes: Prize[] = [];
        const res = await this.client.queryClient.millions.accountPrizes(address);

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

    depositToPool = async (wallet: LumWallet, pool: PoolModel, amount: string) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgMillionsDeposit(pool.poolId, wallet.getAddress(), wallet.getAddress(), false, {
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
            hash: broadcastResult.hash,
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
                LumMessages.BuildMsgMillionsDeposit(deposit.pool.poolId, wallet.getAddress(), wallet.getAddress(), false, {
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
            hash: broadcastResult.hash,
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    leavePool = async (wallet: LumWallet, poolId: Long, depositId: Long) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const message = LumMessages.BuildMsgWithdrawDeposit(poolId, depositId, wallet.getAddress(), wallet.getAddress());

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
            hash: broadcastResult.hash,
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };

    claimPrizes = async (wallet: LumWallet, prizes: Prize[]) => {
        if (this.client === null) {
            return null;
        }

        // Build transaction message
        const messages = [];

        for (const prize of prizes) {
            messages.push(LumMessages.BuildMsgClaimPrize(prize.poolId, prize.drawId, prize.prizeId, wallet.getAddress()));
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
            hash: broadcastResult.hash,
            error: !broadcasted ? (broadcastResult.deliverTx && broadcastResult.deliverTx.log ? broadcastResult.deliverTx.log : broadcastResult.checkTx.log) : null,
        };
    };
}

export default LumClient.Instance;
