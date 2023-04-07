import { LumTypes } from '@lum-network/sdk-javascript';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { biggerCoin } from './numbers';
import { AggregatedDepositModel, DepositModel } from 'models';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

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

export const reduceDepositsByPoolId = (deposits: Partial<DepositModel>[]) => {
    const aggregatedDeposits: AggregatedDepositModel[] = [];

    for (const deposit of deposits) {
        const poolId = deposit.poolId;

        if (poolId === undefined) {
            continue;
        }

        const existingDeposit = aggregatedDeposits.find((d) => d.poolId?.toString() === poolId.toString());

        if (existingDeposit && deposit.state === DepositState.DEPOSIT_STATE_SUCCESS) {
            existingDeposit.deposits.push(deposit);

            const depositAmounts = existingDeposit.deposits.map((d) => Number(d.amount?.amount) || 0);
            const totalDepositAmount = depositAmounts.reduce((a, b) => a + b, 0);

            existingDeposit.amount = {
                ...existingDeposit.amount,
                denom: existingDeposit.amount?.denom || '',
                amount: totalDepositAmount.toString(),
            };
        } else {
            aggregatedDeposits.push({
                ...deposit,
                deposits: [{ ...deposit }],
            });
        }
    }

    return aggregatedDeposits;
};
