import { LumTypes } from '@lum-network/sdk-javascript';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { biggerCoin, convertUnitNumber } from './numbers';
import { AggregatedDepositModel, DepositModel, PoolModel } from 'models';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';
import { getDenomFromIbc, getNormalDenom } from './denoms';
import { ApiConstants } from 'constant';
import { Dayjs } from 'dayjs';

export const getBestPrize = (prizes: Prize[], prices: { [key: string]: number }) => {
    if (prizes.length === 0) {
        return null;
    }

    let bestPrize: LumTypes.Coin | null = null;

    for (const prize of prizes) {
        if (prize.amount === undefined) {
            continue;
        }

        if (bestPrize === null) {
            bestPrize = prize.amount;
        } else {
            bestPrize = biggerCoin(prize.amount, bestPrize, prices);
        }
    }

    if (bestPrize === null) {
        return null;
    }

    return bestPrize;
};

export const getWinningChances = (inputAmount: number, pool: PoolModel, prices?: { [index: string]: number } | number) => {
    const amount = prices ? inputAmount / (typeof prices === 'number' ? prices : prices[getNormalDenom(pool.nativeDenom)] || 1) : inputAmount;
    const tvl = convertUnitNumber(pool.tvlAmount);
    const sponsorTvl = convertUnitNumber(pool.sponsorshipAmount);
    const prizeStrat = pool.prizeStrategy;
    let avgPrizesDrawn = 0;
    let estimated = 0;

    if (prizeStrat) {
        for (const prizeBatch of prizeStrat.prizeBatches) {
            avgPrizesDrawn += (Number(prizeBatch.drawProbability) / ApiConstants.CLIENT_PRECISION) * prizeBatch.quantity.toNumber();
        }

        estimated = (avgPrizesDrawn * amount) / (amount + tvl - sponsorTvl);
    }

    return estimated;
};

export const reduceDepositsByPoolId = async (deposits: Partial<DepositModel>[]) => {
    const aggregatedDeposits: AggregatedDepositModel[] = [];

    for (const deposit of deposits) {
        const poolId = deposit.poolId;

        if (poolId === undefined) {
            continue;
        }

        if (deposit.depositorAddress !== deposit.winnerAddress) {
            continue;
        }

        const existingDeposit = aggregatedDeposits.find((d) => d.poolId?.toString() === poolId.toString());

        if (existingDeposit && deposit.state === DepositState.DEPOSIT_STATE_SUCCESS) {
            existingDeposit.deposits.push({
                ...deposit,
                amount: deposit.amount
                    ? {
                          denom: await getDenomFromIbc(deposit.amount.denom),
                          amount: deposit.amount?.amount || '0',
                      }
                    : undefined,
            });

            const depositAmounts = existingDeposit.deposits.map((d) => Number(d.amount?.amount) || 0);
            const totalDepositAmount = depositAmounts.reduce((a, b) => a + b, 0);

            existingDeposit.amount = {
                ...existingDeposit.amount,
                denom: await getDenomFromIbc(existingDeposit.amount?.denom || ''),
                amount: totalDepositAmount.toString(),
            };
        } else {
            aggregatedDeposits.push({
                ...deposit,
                amount: deposit.amount
                    ? {
                          ...deposit.amount,
                          denom: await getDenomFromIbc(deposit.amount.denom),
                      }
                    : undefined,
                deposits: [
                    {
                        ...deposit,
                        amount: deposit.amount
                            ? {
                                  ...deposit.amount,
                                  denom: await getDenomFromIbc(deposit.amount.denom),
                              }
                            : undefined,
                    },
                ],
            });
        }
    }

    return aggregatedDeposits;
};

// DROPS
export const reduceDepositDropsByPoolIdAndDays = async (deposits: Partial<DepositModel>[]) => {
    const aggregatedDeposits: AggregatedDepositModel[] = [];

    for (const deposit of deposits) {
        const poolId = deposit.poolId;

        if (poolId === undefined || deposit.createdAt === undefined) {
            continue;
        }

        const createdAt = new Dayjs(deposit.createdAt).format('YYYY-MM-DD');

        if (deposit.depositorAddress === deposit.winnerAddress) {
            continue;
        }

        const existingDeposit = aggregatedDeposits.find((d) => d.poolId?.toString() === poolId.toString() && new Dayjs(d.createdAt).format('YYYY-MM-DD') === createdAt);

        if (
            existingDeposit &&
            (deposit.state === DepositState.DEPOSIT_STATE_SUCCESS || deposit.state === DepositState.DEPOSIT_STATE_IBC_TRANSFER || deposit.state === DepositState.DEPOSIT_STATE_ICA_DELEGATE)
        ) {
            existingDeposit.deposits.push({
                ...deposit,
                amount: deposit.amount
                    ? {
                          denom: await getDenomFromIbc(deposit.amount.denom),
                          amount: deposit.amount?.amount || '0',
                      }
                    : undefined,
            });

            const depositAmounts = existingDeposit.deposits.map((d) => Number(d.amount?.amount) || 0);
            const totalDepositAmount = depositAmounts.reduce((a, b) => a + b, 0);

            existingDeposit.amount = {
                ...existingDeposit.amount,
                denom: await getDenomFromIbc(existingDeposit.amount?.denom || ''),
                amount: totalDepositAmount.toString(),
            };
        } else {
            aggregatedDeposits.push({
                ...deposit,
                amount: deposit.amount
                    ? {
                          ...deposit.amount,
                          denom: await getDenomFromIbc(deposit.amount.denom),
                      }
                    : undefined,
                deposits: [
                    {
                        ...deposit,
                        amount: deposit.amount
                            ? {
                                  ...deposit.amount,
                                  denom: await getDenomFromIbc(deposit.amount.denom),
                              }
                            : undefined,
                    },
                ],
            });
        }
    }

    return aggregatedDeposits;
};
