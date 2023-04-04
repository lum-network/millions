import { LumClient as Client, LumConstants, LumMessages, LumTypes, LumUtils, LumWallet } from '@lum-network/sdk-javascript';
import { OSMO_POOL_PRIZES, ATOM_POOL_PRIZES } from 'constant/tmp';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import Long from 'long';
import { DepositModel, PoolModel } from 'models';
import { NumbersUtils, PoolsUtils } from 'utils';
import { getNormalDenom } from './denoms';
import { formatTxs } from './txs';

class LumClient {
    private static instance: LumClient | null = null;
    private rpc: string = process.env.REACT_APP_RPC_URL ?? '';
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

        //const prizes = await this.client.queryClient.millions.poolPrizes(pool);
        const prizes = new Promise<Prize[]>((resolve) => {
            setTimeout(() => {
                resolve([...(poolId.equals(1) ? ATOM_POOL_PRIZES : OSMO_POOL_PRIZES)]);
            }, 300);
        });

        return prizes;
    };

    getNextBestPrize = async (pools: PoolModel[], prices: { [key: string]: number }) => {
        if (this.client === null) {
            return null;
        }

        let bestPrize: LumTypes.Coin | null = null;

        for (const pool of pools) {
            if (pool.prizes && pool.prizes.length > 0) {
                const bestPoolPrize = PoolsUtils.getBestPrize(pool.prizes, prices);

                if (bestPoolPrize === null) {
                    continue;
                }

                if (bestPrize === null) {
                    bestPrize = bestPoolPrize;
                } else {
                    bestPrize = NumbersUtils.biggerCoin(bestPoolPrize, bestPrize, prices);
                }
            }
        }

        if (bestPrize === null) {
            return null;
        }

        const amount = (
            Number(LumUtils.convertUnit({ amount: bestPrize.amount, denom: LumConstants.MicroLumDenom }, LumConstants.LumDenom)) * (prices[getNormalDenom(bestPrize.denom)] || 1)
        ).toFixed();

        return {
            amount,
            denom: bestPrize.denom,
        };
    };

    getDeposits = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const deposits = await this.client.queryClient.millions.accountDeposits(address);

        return deposits;
    };

    getWithdrawals = async (address: string, deposits: DepositModel[]) => {
        if (this.client === null) {
            return null;
        }

        const withdrawals = await this.client.queryClient.millions.accountWithdrawals(address);

        if (withdrawals.length > 0) {
            for (const withdrawal of withdrawals) {
                const deposit = deposits.find((d) => d.depositId.equals(withdrawal.depositId));

                if (deposit) {
                    deposit.isWithdrawing = true;
                    deposit.unbondingEndAt = withdrawal.unbondingEndsAt;
                }
            }
        }

        return [...deposits];
    };

    getWalletBalances = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const balances = await this.client.getAllBalances(address);

        return { balances };
    };

    getWalletActivites = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const res = await this.client.searchTx([`message.module='millions' AND transfer.sender='${address}'`, `message.action='Deposit' AND transfer.sender='${address}'`]);

        return { activities: formatTxs(res) };
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
            denom: pool.nativeDenom,
        });

        // Define fees
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '300000',
        };

        // Fetch account number and sequence and chain id
        const account = await this.client.getAccount(wallet.getAddress());
        const chainId = this.getChainId();

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        // Create the transaction document
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo: '',
            messages: [message],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: wallet.getPublicKey(),
                },
            ],
        };

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
        const fee = {
            amount: [{ denom: LumConstants.MicroLumDenom, amount: '25000' }],
            gas: '100000',
        };

        // Fetch account number and sequence and chain id
        const account = await this.client.getAccount(wallet.getAddress());
        const chainId = this.getChainId();

        if (!account || !chainId) {
            return null;
        }

        const { accountNumber, sequence } = account;

        // Create the transaction document
        const doc: LumTypes.Doc = {
            chainId,
            fee,
            memo: '',
            messages: [message],
            signers: [
                {
                    accountNumber,
                    sequence,
                    publicKey: wallet.getPublicKey(),
                },
            ],
        };

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
