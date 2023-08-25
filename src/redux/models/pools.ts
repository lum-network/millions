import Long from 'long';
import { createModel } from '@rematch/core';
import { ApiConstants, PoolsConstants } from 'constant';
import { DrawModel, PoolModel } from 'models';
import { DenomsUtils, LumClient, NumbersUtils, PoolsUtils, WalletClient } from 'utils';
import { RootModel } from '.';
import dayjs from 'dayjs';
import { LumConstants } from '@lum-network/sdk-javascript';
import { PoolState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/pool';
import { LumApi } from 'api';

interface PoolsState {
    pools: PoolModel[];
    bestPoolPrize: PoolModel | null;
    depositDelta: number | null;
    mutexAdditionalInfos: boolean;
}

export const pools = createModel<RootModel>()({
    name: 'pools',
    state: {
        pools: [],
        bestPoolPrize: null,
        depositDelta: null,
        mutexAdditionalInfos: false,
    } as PoolsState,
    reducers: {
        setPools: (state: PoolsState, pools: PoolModel[]): PoolsState => {
            return {
                ...state,
                pools,
            };
        },
        setBestPoolPrize: (state: PoolsState, bestPoolPrize: PoolModel | null): PoolsState => {
            return {
                ...state,
                bestPoolPrize,
            };
        },
        setDepositDelta: (state: PoolsState, depositDelta: number) => {
            return {
                ...state,
                depositDelta,
            };
        },
        setMutexAdditionalInfos: (state: PoolsState, mutexAdditionalInfos: boolean): PoolsState => {
            return {
                ...state,
                mutexAdditionalInfos,
            };
        },
    },
    effects: (dispatch) => ({
        async fetchPools() {
            try {
                const res = await LumClient.getPools();

                if (res) {
                    const pools: PoolModel[] = [];

                    for (const pool of res) {
                        if (pool.state !== PoolState.POOL_STATE_READY) {
                            continue;
                        }

                        const draws = await dispatch.pools.getPoolDraws({ poolId: pool.poolId, nativeDenom: pool.nativeDenom });
                        const leaderboard = await dispatch.pools.getLeaderboard({ poolId: pool.poolId, limit: 15 });

                        const nextDrawAt = dayjs(pool.lastDrawCreatedAt || pool.drawSchedule?.initialDrawAt)
                            .add(pool.lastDrawCreatedAt ? pool.drawSchedule?.drawDelta?.seconds.toNumber() || 0 : 0, 'seconds')
                            .toDate();

                        pools.push({
                            ...pool,
                            internalInfos: PoolsConstants.POOLS[DenomsUtils.getNormalDenom(pool.nativeDenom)],
                            apy: 0,
                            draws,
                            nextDrawAt,
                            leaderboard: {
                                items: leaderboard || [],
                                fullyLoaded: false,
                            },
                            currentPrizeToWin: null,
                            estimatedPrizeToWin: null,
                        });
                    }

                    dispatch.pools.setPools(pools);

                    return pools;
                }
            } catch {}
        },
        async getPoolPrizes(poolId: Long) {
            try {
                const res = await LumClient.getPoolPrizes(poolId);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async getPoolsAdditionalInfo(_, state) {
            if (state.pools.mutexAdditionalInfos) {
                return;
            }

            dispatch.pools.setMutexAdditionalInfos(true);

            try {
                const pools = [...state.pools.pools];

                for (const pool of pools) {
                    // Calculate Prize to win
                    const availablePrizePool = NumbersUtils.convertUnitNumber(pool.availablePrizePool?.amount || '0');

                    if (pool.nativeDenom !== LumConstants.MicroLumDenom && !pool.internalInfos) {
                        continue;
                    }

                    const client = new WalletClient();

                    await client.connect((pool.nativeDenom === LumConstants.MicroLumDenom ? process.env.REACT_APP_RPC_LUM : pool.internalInfos?.rpc) || '', undefined, true);

                    const [bankBalance, stakingRewards] = await Promise.all([
                        client.getIcaAccountBankBalance(pool.icaPrizepoolAddress, pool.nativeDenom),
                        client.getIcaAccountStakingRewards(pool.icaDepositAddress),
                    ]);

                    const prizePool =
                        availablePrizePool +
                        NumbersUtils.convertUnitNumber(bankBalance ? parseInt(bankBalance.amount, 10) : 0) +
                        NumbersUtils.convertUnitNumber(
                            stakingRewards
                                ? stakingRewards.total
                                      .filter((reward) => reward.denom === pool.nativeDenom)
                                      .reduce((a, b) => a + parseInt(b.amount, 10) / ApiConstants.CLIENT_PRECISION, 0)
                                      .toString()
                                : '0',
                        );

                    pool.currentPrizeToWin = { amount: prizePool, denom: pool.nativeDenom };

                    // Calculate APY
                    const [bonding, supply, communityTaxRate, inflation, feesStakers] = await Promise.all([
                        client.getBonding(),
                        client.getSupply(pool.nativeDenom),
                        client.getCommunityTaxRate(),
                        client.getInflation(),
                        LumClient.getFeesStakers(),
                    ]);

                    const stakingRatio = NumbersUtils.convertUnitNumber(bonding || '0') / NumbersUtils.convertUnitNumber(supply || '1');
                    const poolTvl = NumbersUtils.convertUnitNumber(pool.tvlAmount);
                    const poolSponsorTvl = NumbersUtils.convertUnitNumber(pool.sponsorshipAmount);

                    const nativeApy = ((inflation || 0) * (1 - (communityTaxRate || 0))) / stakingRatio;
                    const variableApy = (nativeApy * (1 - (feesStakers || 0)) * poolTvl) / (poolTvl - poolSponsorTvl);

                    pool.apy = variableApy * 100;

                    // Calculate estimated prize to win
                    const endDate = dayjs(pool.nextDrawAt);
                    const remainingDurationAsMinutes = dayjs.duration(endDate.diff(dayjs())).asMinutes();

                    const apyPerMinute = nativeApy / (365 * 24 * 60);

                    const estimatedPrizePool = prizePool + poolTvl * apyPerMinute * remainingDurationAsMinutes;

                    pool.estimatedPrizeToWin = { amount: estimatedPrizePool, denom: pool.nativeDenom };

                    client.disconnect();
                }

                dispatch.pools.setPools(pools);
                await dispatch.pools.getNextBestPrize(null);
            } catch (e) {
                dispatch.pools.setMutexAdditionalInfos(false);

                console.warn((e as Error).message);
            }

            dispatch.pools.setMutexAdditionalInfos(false);
        },
        async getPoolDraws({ poolId, nativeDenom }: { poolId: Long; nativeDenom: string }) {
            try {
                const res = await LumClient.getPoolDraws(poolId);
                const draws: DrawModel[] = [];

                if (res) {
                    for (const draw of res) {
                        const [marketData] = await LumApi.fetchMarketData(draw.createdAt || new Date());

                        draws.push({
                            ...draw,
                            usdTokenValue:
                                marketData && marketData.length ? marketData[0].marketData?.find((data) => data.denom === DenomsUtils.getNormalDenom(nativeDenom))?.price || undefined : undefined,
                        });
                    }

                    return draws;
                }
            } catch {}
        },
        async getNextBestPrize(_, state) {
            try {
                const pools = state.pools.pools;

                if (!pools || pools.length === 0) {
                    return;
                }

                const prices = state.stats.prices;

                const sortedPools = pools.sort(
                    (a, b) =>
                        (b.estimatedPrizeToWin?.amount || 0) * prices[DenomsUtils.getNormalDenom(b.estimatedPrizeToWin?.denom || 'uatom')] -
                        (a.estimatedPrizeToWin?.amount || 0) * prices[DenomsUtils.getNormalDenom(a.estimatedPrizeToWin?.denom || 'uatom')],
                );

                if (sortedPools.length === 0) {
                    return;
                }

                dispatch.pools.setBestPoolPrize(sortedPools[0]);
            } catch {}
        },
        async getDepositDelta() {
            try {
                const depositDelta = await LumClient.getMinDepositDelta();

                if (depositDelta) {
                    dispatch.pools.setDepositDelta(depositDelta);
                }
            } catch {}
        },
        async getLeaderboard(payload: { poolId: Long; limit?: number }) {
            try {
                const [res] = await LumApi.fetchLeaderboard(payload.poolId.toString(), payload.limit);

                if (res) {
                    return res;
                }
            } catch {}
        },
        async getNextLeaderboardPage(payload: { poolId: Long; page: number; limit?: number }, state) {
            const { poolId, page, limit } = payload;

            const pools = [...state.pools.pools];
            const pool = PoolsUtils.getPoolByPoolId(pools, poolId.toString());

            if (pool && !pool.leaderboard.fullyLoaded) {
                try {
                    const [res, metadata] = await LumApi.fetchLeaderboard(poolId.toString(), limit, page);

                    pool.leaderboard.items.push(...res);

                    if (!metadata.hasNextPage) {
                        pool.leaderboard.fullyLoaded = true;
                    }

                    dispatch.pools.setPools(pools);
                } catch {}
            }
        },
    }),
});
