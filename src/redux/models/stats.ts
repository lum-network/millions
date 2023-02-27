import { createModel } from '@rematch/core';
import { ImperatorApi } from 'api';
import { RootModel } from '.';

interface StatsState {
    lumPrice: number;
    evmosPrice: number;
    atomPrice: number;
    osmoPrice: number;
    crePrice: number;
}

export const stats = createModel<RootModel>()({
    name: 'stats',
    state: {
        lumPrice: 0,
        evmosPrice: 0,
        atomPrice: 0,
        osmoPrice: 0,
        crePrice: 0,
    } as StatsState,
    reducers: {
        setLumPrice: (state: StatsState, payload: number) => {
            return {
                ...state,
                lumPrice: payload,
            };
        },
        setEvmosPrice: (state: StatsState, payload: number) => {
            return {
                ...state,
                evmosPrice: payload,
            };
        },
        setAtomPrice: (state: StatsState, payload: number) => {
            return {
                ...state,
                atomPrice: payload,
            };
        },
        setOsmoPrice: (state: StatsState, payload: number) => {
            return {
                ...state,
                osmoPrice: payload,
            };
        },
        setCrePrice: (state: StatsState, payload: number) => {
            return {
                ...state,
                crePrice: payload,
            };
        },
    },
    effects: (dispatch) => ({
        async fetchStats() {
            const [evmos] = await ImperatorApi.getTokenPrice('evmos');
            console.log(evmos);
            /* Promise.allSettled([
                ImperatorApi.getTokenPrice('lum'),
                ImperatorApi.getTokenPrice('evmos'),
                ImperatorApi.getTokenPrice('atom'),
                ImperatorApi.getTokenPrice('osmo'),
                ImperatorApi.getTokenPrice('cre'),
            ]).then((results) => {
                console.log(results);
                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        const token = result.value[0];
                        if (token && token.length > 0) {
                            switch (token[0].denom) {
                                case 'lum':
                                    dispatch.stats.setLumPrice(token[0].price);
                                    break;
                                case 'evmos':
                                    dispatch.stats.setEvmosPrice(token[0].price);
                                    break;
                                case 'atom':
                                    dispatch.stats.setAtomPrice(token[0].price);
                                    break;
                                case 'osmo':
                                    dispatch.stats.setOsmoPrice(token[0].price);
                                    break;
                                case 'cre':
                                    dispatch.stats.setCrePrice(token[0].price);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                });
            }); */
        },
    }),
});
