import { LumTypes } from '@lum-network/sdk-javascript';
import numeral from 'numeral';
import { getNormalDenom } from './denoms';
import { convertUnitNumber } from './numbers';

export const getTotalBalance = (balances: LumTypes.Coin[], prices: { [denom: string]: number }) => {
    let totalBalance = 0;
    let missingPrice = false;

    balances.forEach((balance) => {
        const price = Object.entries(prices).find((price) => price[0] === getNormalDenom(balance.denom));
        const convertedAmount = convertUnitNumber(balance.amount);

        if (price) {
            totalBalance += convertedAmount * price[1];
        } else {
            missingPrice = true;
        }
    });

    return missingPrice ? null : totalBalance;
};

export const getMaxAmount = (denom?: string, balances?: LumTypes.Coin[]) => {
    if (!denom || !balances) {
        return 0;
    }

    const balance = balances?.find((b) => b.denom === denom);

    if (balance) {
        const amount = convertUnitNumber(balance.amount);
        return numeral(amount).format('0,0.[000000]');
    }

    return '0';
};
