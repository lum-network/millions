import { PrizeModel } from 'models';
import { RootModel } from './index';
import { createModel } from '@rematch/core';
import { LumApi } from 'api';

interface PrizesState {
    biggestPrizes: PrizeModel[];
    prizes: PrizeModel[];
}

export const prizes = createModel<RootModel>()({
    name: 'prizes',
    state: {
        biggestPrizes: [],
        prizes: [],
    } as PrizesState,
    reducers: {
        setBiggestPrizes: (state: PrizesState, biggestPrizes: PrizeModel[]): PrizesState => {
            return {
                ...state,
                biggestPrizes,
            };
        },
    },
    effects: (dispatch) => ({
        fetchBiggestPrizes: async () => {
            const [biggestPrizes] = await LumApi.fetchBiggestPrizes();

            dispatch.prizes.setBiggestPrizes(biggestPrizes);
        },
    }),
});
