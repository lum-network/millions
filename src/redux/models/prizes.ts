import { MetadataModel, PrizeModel } from 'models';
import { RootModel } from './index';
import { createModel } from '@rematch/core';
import { LumApi } from 'api';

interface PrizesState {
    biggestPrizes: PrizeModel[];
    prizes: PrizeModel[];
    metadata?: MetadataModel;
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
        setPrizes: (state: PrizesState, prizes: PrizeModel[], metadata: MetadataModel): PrizesState => {
            return {
                ...state,
                prizes,
                metadata,
            };
        },
    },
    effects: (dispatch) => ({
        fetchBiggestPrizes: async () => {
            const [biggestPrizes] = await LumApi.fetchBiggestPrizes();

            dispatch.prizes.setBiggestPrizes(biggestPrizes);
        },
        fetchPrizes: async (page = 0) => {
            const [prizes, metadata] = await LumApi.fetchPrizes(page);

            dispatch.prizes.setPrizes(prizes, metadata);
        },
    }),
});
