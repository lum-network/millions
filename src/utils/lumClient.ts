import { LUM_DENOM, MICRO_LUM_DENOM, convertUnit, getSigningLumClient, ibc, lum } from '@lum-network/sdk-javascript';
import { Draw } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/draw';
import { Withdrawal, WithdrawalState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/withdrawal';
import { QueryWithdrawalsResponse, QueryDepositsResponse } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/query';
import { DepositState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';
import { Prize } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/prize';
import { PageRequest } from '@lum-network/sdk-javascript/build/codegen/helpers';
import { SigningStargateClient, assertIsDeliverTxSuccess, coins } from '@cosmjs/stargate';
import { OfflineSigner } from '@cosmjs/proto-signing';
import { Dec, IntPretty } from '@keplr-wallet/unit';

import { LumApi } from 'api';
import { AggregatedDepositModel, DepositModel, LumWalletModel, PoolModel, PrizeModel } from 'models';
import { PoolsUtils } from 'utils';

import { formatTxs } from './txs';
import { getDenomFromIbc } from './denoms';

const { deposit, claimPrize, withdrawDeposit, withdrawDepositRetry, depositRetry } = lum.network.millions.MessageComposer.withTypeUrl;

class LumClient {
    private static instance: LumClient | null = null;
    private rpc: string = process.env.REACT_APP_RPC_LUM ?? '';
    private signingClient: SigningStargateClient | null = null;
    private lumQueryClient: Awaited<ReturnType<typeof lum.ClientFactory.createRPCQueryClient>> | null = null;
    private ibcQueryClient: Awaited<ReturnType<typeof ibc.ClientFactory.createRPCQueryClient>> | null = null;
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
        if (this.signingClient) {
            return;
        }

        try {
            const { createRPCQueryClient } = lum.ClientFactory;
            const { createRPCQueryClient: createIbcRPCQueryClient } = ibc.ClientFactory;

            const lumQueryClient = await createRPCQueryClient({ rpcEndpoint: this.rpc });
            const ibcQueryClient = await createIbcRPCQueryClient({ rpcEndpoint: this.rpc });

            this.lumQueryClient = lumQueryClient;
            this.ibcQueryClient = ibcQueryClient;
            this.chainId = (await ibcQueryClient.cosmos.base.tendermint.v1beta1.getNodeInfo()).nodeInfo?.network || 'lum-network-1';
        } catch (e) {
            throw e as Error;
        }
    };

    connectSigner = async (offlineSigner: OfflineSigner) => {
        try {
            const cosmosSigningClient = await getSigningLumClient({
                rpcEndpoint: this.rpc,
                signer: offlineSigner,
            });

            this.signingClient = cosmosSigningClient;
        } catch {}
    };

    getPools = async () => {
        if (this.lumQueryClient === null) {
            return null;
        }

        const res = await this.lumQueryClient.lum.network.millions.pools();

        return res.pools;
    };

    getPoolDraws = async (poolId: bigint) => {
        if (this.lumQueryClient === null) {
            return null;
        }

        const draws: Draw[] = [];
        let res = await this.lumQueryClient.lum.network.millions.poolDraws({ poolId });
        let page: Uint8Array | undefined = res.pagination?.nextKey;

        const total = Number(res.pagination?.total) || 100;

        draws.push(...res.draws);

        if (total > 100 && res.draws.length === 100) {
            for (let i = 0; i < total; i += 100) {
                res = await this.lumQueryClient.lum.network.millions.poolDraws({ poolId });
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
        if (this.lumQueryClient === null) {
            return null;
        }

        const res = await this.lumQueryClient.lum.network.millions.poolPrizes({ poolId });

        return res.prizes;
    };

    getDepositsAndWithdrawals = async (address: string): Promise<null | AggregatedDepositModel[]> => {
        if (this.lumQueryClient === null) {
            return null;
        }

        let pageDeposits: Uint8Array | undefined = undefined;
        const deposits: DepositModel[] = [];

        while (true) {
            const resDeposits: QueryDepositsResponse = await this.lumQueryClient.lum.network.millions.accountDeposits({
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
            const resWithdrawals: QueryWithdrawalsResponse = await this.lumQueryClient.lum.network.millions.accountWithdrawals({
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
                withdrawalCanBeRetried: withdrawal.errorState === WithdrawalState.WITHDRAWAL_STATE_IBC_TRANSFER || withdrawal.errorState === WithdrawalState.WITHDRAWAL_STATE_ICA_UNDELEGATE,
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
        if (this.signingClient === null) {
            return null;
        }

        const balances = await this.signingClient.getAllBalances(address);

        return { balances };
    };

    getWalletActivities = async (address: string) => {
        if (this.signingClient === null) {
            return null;
        }

        const txs = [];
        let totalCount = 0;

        const queries = [
            // Query deposits
            [
                { key: 'deposit.depositor', value: address },
                { key: 'deposit.winner', value: address },
            ],

            // Query claim prize
            [{ key: 'prize_claim.winner', value: address }],

            // Query leave pool
            [
                { key: 'withdraw_deposit.depositor', value: address },
                { key: 'withdraw_deposit.recipient', value: address },
            ],
        ];

        // Already checked if signingClient is not null so disable eslint error
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const res = await Promise.allSettled(queries.map((query) => this.signingClient!.searchTx(query)));

        for (const r of res) {
            if (r.status === 'fulfilled' && r.value !== undefined) {
                txs.push(...r.value);
                totalCount += r.value.length;
            }
        }

        return {
            activities: await formatTxs(txs, true),
            totalCount,
        };
    };

    getWalletPrizes = async (address: string): Promise<{ prizes: Prize[] } | null> => {
        if (this.lumQueryClient === null) {
            return null;
        }

        const prizes: Prize[] = [];
        const res = await this.lumQueryClient.lum.network.millions.accountPrizes({ winnerAddress: address });

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
        if (this.ibcQueryClient === null) {
            return null;
        }

        return this.ibcQueryClient.ibc.applications.transfer.v1.denomTrace({ hash: ibcDenom });
    };

    getFeesStakers = async () => {
        if (this.lumQueryClient === null) {
            return null;
        }

        return Number((await this.lumQueryClient.lum.network.millions.params()).params?.feesStakers || '0');
    };

    getMinDepositDelta = async () => {
        if (this.lumQueryClient === null) {
            return null;
        }

        const depositDelta = (await this.lumQueryClient.lum.network.millions.params()).params?.minDepositDrawDelta?.seconds;

        if (!depositDelta) {
            return null;
        }

        return depositDelta;
    };

    depositToPool = async (wallet: LumWalletModel, pool: PoolModel, amount: string) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const message = deposit({
            poolId: pool.poolId,
            depositorAddress: wallet.address,
            winnerAddress: wallet.address,
            isSponsor: false,
            amount: {
                amount: convertUnit({ amount, denom: LUM_DENOM }, MICRO_LUM_DENOM),
                denom: pool.denom,
            },
        });

        const gasEstimated = await this.signingClient.simulate(wallet.address, [message], '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, [message], fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    depositRetry = async (wallet: LumWalletModel, poolId: bigint, depositId: bigint) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const message = depositRetry({ poolId, depositId, depositorAddress: wallet.address });

        const gasEstimated = await this.signingClient.simulate(wallet.address, [message], '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, [message], fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    multiDeposit = async (wallet: LumWalletModel, toDeposit: { pool: PoolModel; amount: string }[]) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const messages = [];

        for (const d of toDeposit) {
            messages.push(
                deposit({
                    poolId: d.pool.poolId,
                    depositorAddress: wallet.address,
                    winnerAddress: wallet.address,
                    isSponsor: false,
                    amount: {
                        amount: d.amount,
                        denom: d.pool.denom,
                    },
                }),
            );
        }

        const gasEstimated = await this.signingClient.simulate(wallet.address, messages, '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, messages, fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    leavePool = async (wallet: LumWalletModel, poolId: bigint, depositId: bigint) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const message = withdrawDeposit({ poolId, depositId, depositorAddress: wallet.address, toAddress: wallet.address });

        const gasEstimated = await this.signingClient.simulate(wallet.address, [message], '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, [message], fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    leavePoolRetry = async (wallet: LumWalletModel, poolId: bigint, withdrawalId: bigint) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const message = withdrawDepositRetry({ poolId, withdrawalId, depositorAddress: wallet.address });

        const gasEstimated = await this.signingClient.simulate(wallet.address, [message], '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, [message], fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };

    claimPrizes = async (wallet: LumWalletModel, prizes: PrizeModel[]) => {
        if (this.signingClient === null) {
            return null;
        }

        // Build transaction message
        const messages = [];

        for (const prize of prizes) {
            messages.push(claimPrize({ poolId: BigInt(prize.poolId), drawId: BigInt(prize.drawId), prizeId: BigInt(prize.prizeId), winnerAddress: wallet.address }));
        }

        const gasEstimated = await this.signingClient.simulate(wallet.address, messages, '');
        const fee = {
            amount: coins('25000', MICRO_LUM_DENOM),
            gas: new IntPretty(new Dec(gasEstimated).mul(new Dec(1.3))).maxDecimals(0).locale(false).toString(),
        };

        const broadcastResult = await this.signingClient.signAndBroadcast(wallet.address, messages, fee);

        // Verify the transaction was successfully broadcasted and made it into a block
        assertIsDeliverTxSuccess(broadcastResult);

        return {
            hash: broadcastResult.transactionHash,
            error: broadcastResult.code !== 0 ? broadcastResult.rawLog : null,
        };
    };
}

export default LumClient.Instance;
