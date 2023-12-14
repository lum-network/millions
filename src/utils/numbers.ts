import numeral from 'numeral';
import { Coin } from '@keplr-wallet/types';
import { LumConstants } from 'constant';

export const convertUnit = (coin: Coin, toDenom: string): string => {
    const parts = coin.amount.split('.');
    if (parts.length > 2) {
        throw new Error('More than one separator found');
    }

    if (coin.denom === toDenom) {
        return coin.amount;
    } else if (coin.denom.startsWith('u') && coin.denom.endsWith(toDenom)) {
        // from micro to base
        if (parts.length !== 1) {
            throw new Error('Micro units cannot have floating precision');
        }
        let res = parts[0];
        for (let i = res.length; res.length <= LumConstants.LumExponent; i++) {
            res = '0' + res;
        }
        const floatIdx = res.length - LumConstants.LumExponent;
        return (res.substring(0, floatIdx) + '.' + res.substring(floatIdx)).replace(/0+$/, '');
    } else if (toDenom.startsWith('u') && toDenom.endsWith(coin.denom)) {
        // form base to micro
        if (parts.length === 2 && parts[1].length > LumConstants.LumExponent) {
            throw new Error(`Floating precision cannot exceed ${LumConstants.LumExponent} digits`);
        }
        let res = parts[0] + (parts[1] || '');
        for (let i = parts.length === 2 ? parts[1].length : 0; i < LumConstants.LumExponent; i++) {
            res += '0';
        }
        return res.replace(/^0+/, '');
    }
    return coin.amount;
};

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

    return parseFloat(convertUnit(coin, toDenom));
};

export const formatUnit = (coin: Coin, moreDecimal?: boolean): string => {
    return numeral(convertUnit(coin, LumConstants.LumDenom)).format(moreDecimal ? '0,0.[000000]' : '0,0.[000]');
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
    const coin1Amount = parseFloat(convertUnit(coin1, LumConstants.LumDenom));
    const coin2Amount = parseFloat(convertUnit(coin2, LumConstants.LumDenom));

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
