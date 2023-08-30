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

            await dispatch.stats.fetchStats();
            await dispatch.pools.fetchPools(null);
            await dispatch.pools.getPoolsAdditionalInfo(null);
            await dispatch.pools.getDepositDelta();
            await dispatch.prizes.fetchBiggestPrizes();

            dispatch.app.SET_INITIALIZED(true);
        },
    }),
});
