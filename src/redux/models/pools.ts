import Long from 'long';
import { createModel } from '@rematch/core';
import { PoolsConstants } from 'constant';
import { PoolModel } from 'models';
import { DenomsUtils, LumClient } from 'utils';
import { RootModel } from '.';
import { LumTypes } from '@lum-network/sdk-javascript';

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
                        const prizes = await dispatch.pools.getPoolPrizes(pool.poolId);

                        pools.push({
                            ...pool,
                            internalInfos: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(pool.nativeDenom)],
                            prizes,
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
