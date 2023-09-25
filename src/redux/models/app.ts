import { createModel } from '@rematch/core';
import { LumClient } from 'utils';
import { RootModel } from '.';
export const app = createModel<RootModel>()({
    name: 'app',
    state: false,
    reducers: {
        SET_INITIALIZED: (_, initialized: boolean) => {
            return initialized;
        },
    },
    effects: (dispatch) => ({
        async init() {
            await LumClient.connect();

            await Promise.allSettled([
                dispatch.stats.fetchStats(),
                dispatch.pools.fetchPools(null),
                dispatch.pools.getDepositDelta(),
                dispatch.pools.getActiveCampaigns(),
                dispatch.prizes.fetchBiggestPrizes(),
                dispatch.prizes.fetchBiggestAprPrizes(),
            ]);

            await dispatch.pools.getPoolsAdditionalInfo(null);

            dispatch.app.SET_INITIALIZED(true);
        },
    }),
});
