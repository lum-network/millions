import { createModel } from '@rematch/core';
import { ImperatorApi } from 'api';
import { RootModel } from '.';

interface StatsState {
    prices: {
        [key: string]: number;
    };
}

export const stats = createModel<RootModel>()({
    name: 'stats',
    state: {
        prices: {},
    } as StatsState,
    reducers: {
        setAssetPrice: (state: StatsState, payload: { price: number; denom: string }) => {
            return {
                ...state,
                prices: {
                    ...state.prices,
                    [payload.denom]: payload.price,
                },
            };
        },
    },
    effects: (dispatch) => ({
        async fetchStats() {
            Promise.allSettled([
                ImperatorApi.getTokenPrice('lum'),
                ImperatorApi.getTokenPrice('evmos'),
                ImperatorApi.getTokenPrice('atom'),
                ImperatorApi.getTokenPrice('osmo'),
                ImperatorApi.getTokenPrice('cre'),
            ]).then((results) => {
                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        const token = result.value[0];
                        if (token && token.length > 0) {
                            dispatch.stats.setAssetPrice(token[0]);
                        }
                    }
                });
            });
        },
    }),
});
