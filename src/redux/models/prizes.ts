import { BiggestAprPrizeModel, MetadataModel, PrizeModel, PrizeStatsModel } from 'models';
import { RootModel } from './index';
import { createModel } from '@rematch/core';
import { LumApi } from 'api';

interface PrizesState {
    biggestPrizes: PrizeModel[];
    biggestAprPrizes: BiggestAprPrizeModel[];
    prizes: PrizeModel[];
    metadata?: MetadataModel;
    stats: PrizeStatsModel | null;
    alreadySeenConfetti: boolean;
}

export const prizes = createModel<RootModel>()({
    name: 'prizes',
    state: {
        biggestPrizes: [],
        biggestAprPrizes: [],
        prizes: [],
        stats: null,
        alreadySeenConfetti: false,
    } as PrizesState,
    reducers: {
        setBiggestPrizes: (state: PrizesState, biggestPrizes: PrizeModel[]): PrizesState => {
            return {
                ...state,
                biggestPrizes,
            };
        },
        setBiggestAprPrizes: (state: PrizesState, biggestAprPrizes: BiggestAprPrizeModel[]): PrizesState => {
            return {
                ...state,
                biggestAprPrizes,
            };
        },
        setPrizes: (state: PrizesState, prizes: PrizeModel[], metadata: MetadataModel): PrizesState => {
            return {
                ...state,
                prizes,
                metadata,
            };
        },
        resetPrizes: (state: PrizesState): PrizesState => {
            return {
                ...state,
                prizes: [],
                metadata: undefined,
            };
        },
        setStats: (state: PrizesState, stats: PrizeStatsModel): PrizesState => {
            return {
                ...state,
                stats,
            };
        },
        resetStats: (state: PrizesState): PrizesState => {
            return {
                ...state,
                stats: null,
            };
        },
        setAlreadySeenConfetti: (state: PrizesState, alreadySeenConfetti: boolean): PrizesState => {
            return {
                ...state,
                alreadySeenConfetti,
            };
        },
    },
    effects: (dispatch) => ({
        fetchBiggestPrizes: async () => {
            console.log('------------------------------- [Prizes] fetchBiggestPrizes -------------------------------');

            const [biggestPrizes] = await LumApi.fetchBiggestPrizes();

            dispatch.prizes.setBiggestPrizes(biggestPrizes);
        },

        fetchBiggestAprPrizes: async () => {
            console.log('------------------------------- [Prizes] fetchBiggestAprPrizes -------------------------------');

            const [biggestAprPrizes] = await LumApi.fetchBiggestAprPrizes();

            dispatch.prizes.setBiggestAprPrizes(biggestAprPrizes);
        },

        fetchPrizes: async ({ page = 0, poolId }: { page: number; poolId?: string }) => {
            console.log('------------------------------- [Prizes] fetchPrizes -------------------------------');

            dispatch.prizes.resetPrizes();

            if (poolId) {
                const [prizes, metadata] = await LumApi.fetchBiggestPrizesByPoolId(page, poolId);

                dispatch.prizes.setPrizes(prizes, metadata);
            } else {
                const [prizes, metadata] = await LumApi.fetchPrizes(page);

                dispatch.prizes.setPrizes(prizes, metadata);
            }
        },

        getStats: async (poolId: string) => {
            console.log('------------------------------- [Prizes] getStats -------------------------------');

            dispatch.prizes.resetStats();

            const [stats] = await LumApi.getPrizesStats(poolId);

            dispatch.prizes.setStats(stats);
        },

        seenConfetti: () => {
            dispatch.prizes.setAlreadySeenConfetti(true);
        },
    }),
});
