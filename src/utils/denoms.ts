import { DenomsConstants } from 'constant';

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
