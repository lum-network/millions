import { LumClient as Client, LumConstants, LumMessages, LumTypes, LumUtils, LumWallet } from '@lum-network/sdk-javascript';
// import { OSMO_POOL_PRIZES, ATOM_POOL_PRIZES } from 'constant/tmp';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import Long from 'long';
import { AggregatedDepositModel, DepositModel, PoolModel } from 'models';
import { NumbersUtils, PoolsUtils, WalletUtils } from 'utils';
import { getNormalDenom } from './denoms';
import { formatTxs } from './txs';
import { searchTxByTags } from '@lum-network/sdk-javascript/build/utils';

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

        const pools = await this.client.queryClient.millions.pools();

        /* const pools = new Promise<Pool[]>((resolve) => {
            setTimeout(() => {
                resolve([...POOLS]);
            }, 300);
        }); */

        return pools;
    };

    getPoolPrizes = async (poolId: Long) => {
        if (this.client === null) {
            return null;
        }

        const prizes = await this.client.queryClient.millions.poolPrizes(poolId);
        // const prizes = new Promise<Prize[]>((resolve) => {
        //     setTimeout(() => {
        //         resolve([...(poolId.equals(1) ? ATOM_POOL_PRIZES : OSMO_POOL_PRIZES)]);
        //     }, 300);
        // });

        return prizes;
    };

    getDepositsAndWithdrawals = async (address: string): Promise<null | AggregatedDepositModel[]> => {
        if (this.client === null) {
            return null;
        }

        const deposits = await this.client.queryClient.millions.accountDeposits(address);

        const aggregatedDeposits = await PoolsUtils.reduceDepositsByPoolId(deposits);

        const withdrawals = await this.client.queryClient.millions.accountWithdrawals(address);

        const withdrawalsToDeposit: Partial<DepositModel>[] = [];

        for (const withdrawal of withdrawals) {
            withdrawalsToDeposit.push({
                poolId: withdrawal.poolId,
                amount: withdrawal.amount,
                depositId: withdrawal.withdrawalId,
                depositorAddress: withdrawal.depositorAddress,
                isWithdrawing: true,
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

    getWalletActivities = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const res = await this.client.searchTx([
            searchTxByTags([
                { key: 'message.module', value: 'millions' },
                { key: 'transfer.sender', value: address },
            ]),
            searchTxByTags([
                { key: 'message.module', value: 'millions' },
                { key: 'transfer.recipient', value: address },
            ]),
        ]);

        return { activities: await formatTxs(res, true) };
    };

    getWalletPrizes = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const res = await this.client.queryClient.millions.accountPrizes(address);

        return { prizes: res };
    };

    getDenomTrace = async (ibcDenom: string) => {
        if (this.client === null) {
            return null;
        }

        const denomTrace = await this.client.queryClient.ibc.transfer.denomTrace(ibcDenom);

        return denomTrace;
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
        const fee = WalletUtils.buildTxFee('25000', '300000');

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
                    denom: deposit.pool.nativeDenom,
                }),
            );
        }

        // Define fees
        const fee = WalletUtils.buildTxFee('25000', '300000');

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
        const fee = WalletUtils.buildTxFee('25000', '300000');

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
