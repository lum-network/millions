import Assets from 'assets';

interface DenomsIcons {
    [key: string]: string;
    atom: string;
    cre: string;
    evmos: string;
    lum: string;
    osmo: string;
    cro: string;
}

export const DENOMS_ICONS: DenomsIcons = {
    atom: Assets.chains.atom,
    cre: Assets.chains.cre,
    evmos: Assets.chains.evmos,
    lum: Assets.chains.lum,
    osmo: Assets.chains.osmo,
    cro: Assets.chains.cro,
};

export const ALLOWED_DENOMS = ['atom', 'evmos', 'lum', 'cre', 'osmo', 'cro'];

export const IBC_MINIMAL_MAP: {
    [key: string]: string;
} = {
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': 'uatom',
};
