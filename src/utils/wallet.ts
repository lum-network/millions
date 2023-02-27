import { LumTypes } from '@lum-network/sdk-javascript';
import { DenomsConstants } from 'constant';

const hasAllPrices = (prices: { [denom: string]: number }) => {
    let hasAllPrices = true;

    DenomsConstants.ALLOWED_DENOMS.forEach((denom) => {
        const price = Object.entries(prices).find((price) => price[0] === denom);

        if (!price) {
            hasAllPrices = false;
            return;
        }
    });

    return hasAllPrices;
};

export const getTotalBalance = (balances: LumTypes.Coin[], prices: { [denom: string]: number }) => {
    let totalBalance = 0;

    if (!hasAllPrices(prices)) {
        return null;
    }

    balances.forEach((balance) => {
        const price = Object.entries(prices).find((price) => price[0] === balance.denom);

        if (price) {
            totalBalance += parseFloat(balance.amount) * price[1];
        }
    });

    return totalBalance;
};
