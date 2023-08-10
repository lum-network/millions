import { LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import numeral from 'numeral';

export const convertUnitNumber = (nb: number | string, fromDenom = LumConstants.MicroLumDenom, toDenom = LumConstants.LumDenom): number => {
    let amount: string;

    if (!nb) {
        return 0;
    }

    if (typeof nb === 'string') {
        const split = nb.split('.');

        amount = split[0];
    } else {
        amount = nb.toFixed(fromDenom.startsWith('u') ? 0 : 6);
    }

    const coin = {
        amount,
        denom: fromDenom,
    };

    return parseFloat(LumUtils.convertUnit(coin, toDenom));
};

export const formatUnit = (coin: LumTypes.Coin, moreDecimal?: boolean): string => {
    return numeral(LumUtils.convertUnit(coin, LumConstants.LumDenom)).format(moreDecimal ? '0,0.[000000]' : '0,0.[000]');
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

export const biggerCoin = (coin1: LumTypes.Coin, coin2: LumTypes.Coin, prices: { [key: string]: number }): LumTypes.Coin => {
    const coin1Amount = parseFloat(LumUtils.convertUnit(coin1, LumConstants.LumDenom));
    const coin2Amount = parseFloat(LumUtils.convertUnit(coin2, LumConstants.LumDenom));

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
