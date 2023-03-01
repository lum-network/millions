import { createModel } from '@rematch/core';
import { ImperatorApi } from 'api';
import { DenomsConstants } from 'constant';
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
        setPrices: (state: StatsState, payload: { [denom: string]: number }): StatsState => {
            return {
                ...state,
                prices: {
                    ...state.prices,
                    ...payload,
                },
            };
        },
    },
    effects: (dispatch) => ({
        async fetchStats() {
            try {
                const [res] = await ImperatorApi.getPrices();

                const prices: {
                    [key: string]: number;
                } = res
                    .filter((price) => DenomsConstants.ALLOWED_DENOMS.findIndex((denom) => denom === price.denom) > -1)
                    .reduce((obj: { [key: string]: number }, item) => ((obj[item.denom] = item.price), obj), {});

                dispatch.stats.setPrices(prices);
            } catch {}
        },
    }),
});
