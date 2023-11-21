import { createModel } from '@rematch/core';
import { LumClient } from 'utils';
import { RootModel } from '.';

interface AppState {
    initialized: boolean;
    initMutex: boolean;
}
export const app = createModel<RootModel>()({
    name: 'app',
    state: {
        initialized: false,
        initMutex: false,
    } as AppState,
    reducers: {
        SET_INITIALIZED: (state, initialized: boolean) => {
            return {
                ...state,
                initialized,
            };
        },
        SET_INIT_MUTEX: (state, initMutex: boolean) => {
            return {
                ...state,
                initMutex,
            };
        },
    },
    effects: (dispatch) => ({
        async init(_, state) {
            if (state.app.initialized || state.app.initMutex) {
                return;
            }

            dispatch.app.SET_INIT_MUTEX(true);

            await LumClient.connect();

            try {
                await Promise.allSettled([
                    dispatch.stats.fetchStats(),
                    dispatch.pools.fetchPools(null),
                    dispatch.pools.getDepositDelta(),
                    dispatch.prizes.fetchBiggestPrizes(),
                    dispatch.prizes.fetchBiggestAprPrizes(),
                ]);
            } catch (e) {
                console.error(e);
                dispatch.app.SET_INIT_MUTEX(false);
            }

            dispatch.app.SET_INITIALIZED(true);

            await dispatch.pools.getPoolsAdditionalInfo(null);

            dispatch.app.SET_INIT_MUTEX(false);
        },
    }),
});
