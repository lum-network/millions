import numeral from 'numeral';
import { Coin } from '@keplr-wallet/types';
import { LUM_DENOM, MICRO_LUM_DENOM, convertUnit } from '@lum-network/sdk-javascript';
import { DenomsConstants } from 'constant';

export const convertUnitNumber = (nb: number | string, fromDenom = MICRO_LUM_DENOM, fromMinimalDenom = true): number => {
    let amount: string;

    if (!nb) {
        return 0;
    }

    const specificExponent = DenomsConstants.SPECIFIC_DENOM_DECIMALS[fromDenom];

    if (specificExponent) {
        const nbToNumber = Number(nb);

        if (Number.isNaN(nbToNumber)) {
            return NaN;
        }

        return fromMinimalDenom ? nbToNumber / 10 ** specificExponent : nbToNumber * 10 ** specificExponent;
    }

    if (typeof nb === 'string') {
        const split = nb.split('.');

        amount = split[0];
    } else {
        amount = nb.toFixed(fromDenom.startsWith('u') ? 0 : 6);
    }

    const coin = {
        amount,
        denom: MICRO_LUM_DENOM,
    };

    return parseFloat(convertUnit(coin, LUM_DENOM));
};

export const formatUnit = (coin: Coin, moreDecimal?: boolean): string => {
    return numeral(convertUnit(coin, LUM_DENOM)).format(moreDecimal ? '0,0.[000000]' : '0,0.[000]');
};

export const formatTo6digit = (number: number | string, digits = 6): string => {
    if (typeof number === 'string') {
        number = Number(number);

        if (Number.isNaN(number)) {
            return 'NaN';
        }
    }

    let digitsFormat = '';

    for (let i = 0; i < digits; i++) {
        digitsFormat += '0';
    }

    return number > 0 ? numeral(number).format(`0,0[.]${digitsFormat}`) : '0';
};

export const biggerCoin = (coin1: Coin, coin2: Coin, prices: { [key: string]: number }): Coin => {
    const coin1Amount = parseFloat(convertUnit(coin1, LUM_DENOM));
    const coin2Amount = parseFloat(convertUnit(coin2, LUM_DENOM));

    return coin1Amount * prices[coin1.denom] || 1 > coin2Amount * prices[coin1.denom] || 1 ? coin1 : coin2;
};

export const float2ratio = (x: number) => {
    const baseRatio = 100;
    const x1 = x * baseRatio;

    if (x === 0) {
        return '1 in ';
    }

    if (x1 >= baseRatio) {
        return '1 in 1.01';
    }

    const ratio = 100 / (x * 100);
    return '1 in ' + numeral(ratio).format(ratio > 10 ? '0,0' : '0[.]00');
};
