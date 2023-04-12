import { createModel } from '@rematch/core';
import { LumClient } from 'utils';
import { RootModel } from '.';

export const app = createModel<RootModel>()({
    name: 'app',
    state: false,
    reducers: {
        SET_INITIALIZED: (_, payload: boolean) => {
            return payload;
        },
    },
    effects: (dispatch) => ({
        async init(payload: { withWallets?: boolean }) {
            await LumClient.connect();

            await dispatch.stats.fetchStats();
            await dispatch.pools.fetchPools();

            await dispatch.pools.getNextBestPrize(null);

            if (payload.withWallets) {
                await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: false }).finally(() => null);
                await dispatch.wallet.connectOtherWallets(null);
            }

            dispatch.app.SET_INITIALIZED(true);
        },
    }),
});