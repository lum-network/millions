import { LumTypes } from '@lum-network/sdk-javascript';
import { DenomsConstants } from 'constant';
import CryptoJS from 'crypto-js';
import { LumClient } from 'utils';

export const getNormalDenom = (denom: string) => {
    if (denom.startsWith('u')) {
        denom = denom.slice(1);
    }

    return denom;
};

export const getDenomFromIbc = async (denom: string) => {
    let computedDenom = denom;

    if (!denom.startsWith('ibc/')) {
        return computedDenom;
    }

    await LumClient.getDenomTrace(denom).then((res) => {
        if (res && res.denomTrace) {
            computedDenom = res.denomTrace.baseDenom;
        }
    });

    return computedDenom;
};

export const getIconFromDenom = (denom: string) => {
    denom = getNormalDenom(denom);

    return DenomsConstants.DENOMS_ICONS[denom];
};

export const getIbcDenom = (channel: string, denom: string) => {
    if (denom.startsWith('ibc/')) {
        return denom;
    }

    return 'ibc/' + CryptoJS.SHA256(`transfer/${channel}/${denom}`).toString().toUpperCase();
};

export const translateLumIbcBalances = async (balances: LumTypes.Coin[]) => {
    const translatedBalances: LumTypes.Coin[] = [];

    for (const balance of balances) {
        let translatedBalance = balance;

        if (balance.denom.startsWith('ibc/')) {
            try {
                const res = await LumClient.getDenomTrace(balance.denom);
                if (res && res.denomTrace) {
                    translatedBalance = {
                        amount: balance.amount,
                        denom: res.denomTrace.baseDenom,
                    };
                }
            } catch {}
        }

        translatedBalances.push(translatedBalance);
    }
    return translatedBalances;
};

export const translateIbcBalances = (balances: LumTypes.Coin[], sourceChannel: string, minimalDenom: string) => {
    return balances.map((balance) => {
        if (!balance.denom.startsWith('ibc/')) {
            return balance;
        }

        const ibcDenom = getIbcDenom(sourceChannel, minimalDenom);
        if (ibcDenom === balance.denom) {
            return {
                amount: balance.amount,
                denom: minimalDenom,
            };
        }

        return balance;
    });
};
