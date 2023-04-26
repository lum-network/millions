import Long from 'long';
import { createModel } from '@rematch/core';
import { PoolsConstants } from 'constant';
import { PoolModel } from 'models';
import { DenomsUtils, LumClient } from 'utils';
import { RootModel } from '.';
import { LumTypes } from '@lum-network/sdk-javascript';
import dayjs from 'dayjs';
import { LumApi } from 'api';

interface PoolsState {
    pools: PoolModel[];
    bestPrize: LumTypes.Coin | null;
}

export const pools = createModel<RootModel>()({
    name: 'pools',
    state: {
        pools: [],
        bestPrize: null,
    } as PoolsState,
    reducers: {
        setPools: (state: PoolsState, pools: PoolModel[]): PoolsState => {
            return {
                ...state,
                pools,
            };
        },
        setBestPrize: (state: PoolsState, bestPrize: LumTypes.Coin | null): PoolsState => {
            return {
                ...state,
                bestPrize,
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
                        const nextDrawAt = dayjs(pool.lastDrawCreatedAt || pool.drawSchedule?.initialDrawAt)
                            .add(pool.lastDrawCreatedAt ? pool.drawSchedule?.drawDelta?.seconds.toNumber() || 0 : 0, 'seconds')
                            .toDate();

                        pools.push({
                            ...pool,
                            internalInfos: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(pool.nativeDenom)],
                            prizes,
                            nextDrawAt,
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
                const rewards = poolReward.rewards;

                rewards.amount += Number(poolReward.availablePrizePool.amount);

                if (pool) {
                    pool.prizeToWin = rewards;
                }
            }

            dispatch.pools.setPools(pools);
        },
        async getPoolPrizes(poolId: Long) {
            try {
                const res = await LumClient.getPoolPrizes(poolId);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async getNextBestPrize(_, state) {
            try {
                const payload = state.pools.pools;

                if (!payload || payload.length === 0) {
                    return;
                }

                const res = await LumClient.getNextBestPrize(payload, state.stats.prices);

                if (res) {
                    dispatch.pools.setBestPrize(res);
                }
            } catch {}
        },
    }),
});
