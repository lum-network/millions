import { createModel } from '@rematch/core';
import { LumClient } from 'utils';
import { RootModel } from '.';

interface AppState {
    approvedTermsVersion: number;
    initialized: boolean;
}

export const app = createModel<RootModel>()({
    name: 'app',
    state: {
        approvedTermsVersion: 0,
        initialized: false,
    } as AppState,
    reducers: {
        SET_INITIALIZED: (state, initialized: boolean) => {
            return {
                ...state,
                initialized,
            };
        },
    },
    effects: (dispatch) => ({
        async init(payload: { withWallets?: boolean }) {
            await LumClient.connect();

            await dispatch.stats.fetchStats();
            await dispatch.pools.fetchPools();
            await dispatch.pools.getPoolsAdditionalInfo(null);
            await dispatch.prizes.fetchBiggestPrizes();

            if (payload.withWallets) {
                await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: true }).finally(() => null);
                await dispatch.wallet.connectOtherWallets(null);
            }

            dispatch.app.SET_INITIALIZED(true);
        },
    }),
});
