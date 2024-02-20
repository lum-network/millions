import Assets from 'assets';

interface DenomsIcons {
    [key: string]: string;
    atom: string;
    cre: string;
    evmos: string;
    lum: string;
    osmo: string;
    cro: string;
    huahua: string;
}

export const DENOMS_ICONS: DenomsIcons = {
    atom: Assets.chains.atom,
    cre: Assets.chains.cre,
    evmos: Assets.chains.evmos,
    lum: Assets.chains.lum,
    osmo: Assets.chains.osmo,
    cro: Assets.chains.cro,
    huahua: Assets.chains.huahua,
};

export const ALLOWED_DENOMS = ['atom', 'evmos', 'lum', 'cre', 'osmo', 'cro', 'huahua'];

export const IBC_MINIMAL_MAP: {
    [key: string]: string;
} = {
    'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477': 'uatom',
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': 'uatom',
    'ibc/51A818D8BBC385C152415882286C62169C05498B8EBCFB38310B1367583860FF': 'uhuahua',
};
