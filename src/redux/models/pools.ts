import Long from 'long';
import { createModel } from '@rematch/core';
import { PoolsConstants, ApiConstants } from 'constant';
import { PoolModel } from 'models';
import { DenomsUtils, LumClient, NumbersUtils, WalletClient } from 'utils';
import { RootModel } from '.';
import dayjs from 'dayjs';
import { LumConstants } from '@lum-network/sdk-javascript';
import { Pool } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/pool';

interface PoolsState {
    pools: PoolModel[];
    bestPoolPrize: PoolModel | null;
}

export const pools = createModel<RootModel>()({
    name: 'pools',
    state: {
        pools: [],
        bestPoolPrize: null,
    } as PoolsState,
    reducers: {
        setPools: (state: PoolsState, pools: PoolModel[]): PoolsState => {
            return {
                ...state,
                pools,
            };
        },
        setBestPoolPrize: (state: PoolsState, bestPoolPrize: PoolModel | null): PoolsState => {
            return {
                ...state,
                bestPoolPrize,
            };
        },
    },
    effects: (dispatch) => ({
        async fetchPools() {
            try {
                const res = await LumClient.getPools();

                if (res) {
                    const pools: PoolModel[] = [];

                    for (const pool of res) {
                        //FIXME: Check if we can remove this
                        // const prizes = await dispatch.pools.getPoolPrizes(pool.poolId);
                        const draws = await dispatch.pools.getPoolDraws(pool.poolId);

                        const apy = await dispatch.pools.getPoolApy(pool);

                        const nextDrawAt = dayjs(pool.lastDrawCreatedAt || pool.drawSchedule?.initialDrawAt)
                            .add(pool.lastDrawCreatedAt ? pool.drawSchedule?.drawDelta?.seconds.toNumber() || 0 : 0, 'seconds')
                            .toDate();

                        pools.push({
                            ...pool,
                            internalInfos: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(pool.nativeDenom)],
                            // prizes,
                            draws,
                            nextDrawAt,
                            prizeToWin: null,
                        });
                    }

                    dispatch.pools.setPools(pools);

                    return pools;
                }
            } catch {}
        },
        async getPoolPrizes(poolId: Long) {
            try {
                const res = await LumClient.getPoolPrizes(poolId);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async getPoolsPrizePool(_, state) {
            try {
                const pools = [...state.pools.pools];

                for (const pool of pools) {
                    const availablePrizePool = NumbersUtils.convertUnitNumber(pool.availablePrizePool?.amount || '0');

                    if (pool.nativeDenom === LumConstants.MicroLumDenom) {
                        await WalletClient.connect(process.env.REACT_APP_RPC_LUM || '');
                    } else {
                        if (!pool.internalInfos) {
                            continue;
                        }

                        await WalletClient.connect(pool.internalInfos?.rpc);
                    }

                    const [bankBalance, stakingRewards] = await Promise.all([
                        WalletClient.getIcaAccountBankBalance(pool.icaPrizepoolAddress, pool.nativeDenom),
                        WalletClient.getIcaAccountStakingRewards(pool.icaDepositAddress),
                    ]);

                    const prizePool =
                        availablePrizePool +
                        NumbersUtils.convertUnitNumber(bankBalance ? parseInt(bankBalance.amount, 10) : 0) +
                        NumbersUtils.convertUnitNumber(
                            stakingRewards
                                ? stakingRewards.total
                                      .filter((reward) => reward.denom === pool.nativeDenom)
                                      .reduce((a, b) => a + parseInt(b.amount, 10) / ApiConstants.CLIENT_PRECISION, 0)
                                      .toString()
                                : '0',
                        );

                    pool.prizeToWin = { amount: prizePool, denom: pool.nativeDenom };

                    WalletClient.disconnect();
                }

                dispatch.pools.setPools(pools);
                dispatch.pools.getNextBestPrize(null);
            } catch (e) {
                console.error((e as Error).message);
            }
        },
        async getPoolApy(pool: Pool) {
            //TODO: Implement this
        },
        async getPoolDraws(poolId: Long) {
            try {
                const res = await LumClient.getPoolDraws(poolId);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async getNextBestPrize(_, state) {
            try {
                const pools = state.pools.pools;

                if (!pools || pools.length === 0) {
                    return;
                }

                const prices = state.stats.prices;

                const sortedPools = pools.sort(
                    (a, b) =>
                        (b.prizeToWin?.amount || 0) * prices[DenomsUtils.getNormalDenom(b.prizeToWin?.denom || 'uatom')] -
                        (a.prizeToWin?.amount || 0) * prices[DenomsUtils.getNormalDenom(a.prizeToWin?.denom || 'uatom')],
                );

                if (sortedPools.length === 0) {
                    return;
                }

                dispatch.pools.setBestPoolPrize(sortedPools[0]);
            } catch {}
        },
    }),
});
