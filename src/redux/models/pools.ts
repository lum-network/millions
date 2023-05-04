import Long from 'long';
import { createModel } from '@rematch/core';
import { PoolsConstants } from 'constant';
import { PoolModel } from 'models';
import { DenomsUtils, LumClient } from 'utils';
import { RootModel } from '.';
import dayjs from 'dayjs';
import { LumApi } from 'api';
import { getNormalDenom } from '../../utils/denoms';

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
                        const prizes = await dispatch.pools.getPoolPrizes(pool.poolId);
                        const draws = await dispatch.pools.getPoolDraws(pool.poolId);

                        const nextDrawAt = dayjs(pool.lastDrawCreatedAt || pool.drawSchedule?.initialDrawAt)
                            .add(pool.lastDrawCreatedAt ? pool.drawSchedule?.drawDelta?.seconds.toNumber() || 0 : 0, 'seconds')
                            .toDate();

                        pools.push({
                            ...pool,
                            internalInfos: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(pool.nativeDenom)],
                            prizes,
                            draws,
                            nextDrawAt,
                            prizeToWin: null,
                        });
                    }

                    dispatch.pools.setPools(pools);
                    dispatch.pools.fetchPoolsRewards(null);

                    return pools;
                }
            } catch {}
        },
        async fetchPoolsRewards(_, state) {
            const [poolRewards] = await LumApi.getPoolsRewards();
            const pools = state.pools.pools;

            for (const poolReward of poolRewards) {
                const pool = pools.find((p) => p.poolId.eq(poolReward.id));

                if (pool) {
                    const rewards = poolReward.rewards;

                    rewards.amount += Number(poolReward.availablePrizePool.amount);
                    pool.prizeToWin = rewards;
                }
            }

            dispatch.pools.setPools(pools);
            dispatch.pools.getNextBestPrize(null);
        },
        async getPoolPrizes(poolId: Long) {
            try {
                const res = await LumClient.getPoolPrizes(poolId);

                if (res) {
                    return res;
                }
            } catch {}
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
                        (b.prizeToWin?.amount || 0) * prices[getNormalDenom(b.prizeToWin?.denom || 'uatom')] - (a.prizeToWin?.amount || 0) * prices[getNormalDenom(a.prizeToWin?.denom || 'uatom')],
                );

                if (sortedPools.length === 0) {
                    return;
                }

                dispatch.pools.setBestPoolPrize(sortedPools[0]);
            } catch {}
        },
    }),
});
