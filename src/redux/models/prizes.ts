import { BiggestAprPrizeModel, MetadataModel, PrizeModel, PrizeStatsModel } from 'models';
import { RootModel } from './index';
import { createModel } from '@rematch/core';
import { LumApi } from 'api';

interface PrizesState {
    biggestAprPrizes: BiggestAprPrizeModel[];
    prizes: PrizeModel[];
    metadata?: MetadataModel;
    stats: PrizeStatsModel | null;
    alreadySeenConfetti: boolean;
}

export const prizes = createModel<RootModel>()({
    name: 'prizes',
    state: {
        biggestAprPrizes: [],
        prizes: [],
        stats: null,
        alreadySeenConfetti: false,
    } as PrizesState,
    reducers: {
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
        fetchBiggestAprPrizes: async () => {
            const [biggestAprPrizes] = await LumApi.fetchBiggestAprPrizes();

            dispatch.prizes.setBiggestAprPrizes(biggestAprPrizes);
        },

        fetchPrizes: async ({ page = 0, poolId }: { page: number; poolId?: string }) => {
            dispatch.prizes.resetPrizes();

            try {
                if (poolId) {
                    const [prizes, metadata] = await LumApi.fetchBiggestPrizesByPoolId(page, poolId);

                    dispatch.prizes.setPrizes(prizes, metadata);
                } else {
                    const [prizes, metadata] = await LumApi.fetchPrizes(page);

                    dispatch.prizes.setPrizes(prizes, metadata);
                }
            } catch {}
        },

        getStats: async (poolId: string) => {
            dispatch.prizes.resetStats();

            try {
                const [stats] = await LumApi.getPrizesStats(poolId);

                dispatch.prizes.setStats(stats);
            } catch {}
        },

        seenConfetti: () => {
            dispatch.prizes.setAlreadySeenConfetti(true);
        },
    }),
});
