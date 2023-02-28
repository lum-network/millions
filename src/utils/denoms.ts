import { LumTypes } from '@lum-network/sdk-javascript';
import { DenomsConstants, IbcConstants } from 'constant';
import CryptoJS from 'crypto-js';

export const getNormalDenom = (denom: string) => {
    if (denom.startsWith('u')) {
        denom = denom.slice(1);
    }

    return denom;
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

export const translateIbcBalances = (balances: LumTypes.Coin[]) => {
    return balances.map((balance) => {
        if (!balance.denom.startsWith('ibc/')) {
            return balance;
        }

        const infos = IbcConstants.IBC_INFOS.find((infos) => {
            const ibcDenom = getIbcDenom(infos.sourceChannel, infos.minimalDenom);

            if (ibcDenom === balance.denom) {
                return true;
            }
        });

        if (infos) {
            return {
                amount: balance.amount,
                denom: infos.minimalDenom,
            };
        }

        return balance;
    });
};
