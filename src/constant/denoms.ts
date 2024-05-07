import Assets from 'assets';

interface DenomsIcons {
    [key: string]: string;
    atom: string;
    lum: string;
    osmo: string;
    huahua: string;
}

export const DENOMS_ICONS: DenomsIcons = {
    atom: Assets.chains.atom,
    lum: Assets.chains.lum,
    osmo: Assets.chains.osmo,
    huahua: Assets.chains.huahua,
    inj: Assets.chains.inj,
};

export const ALLOWED_DENOMS = ['atom', 'lum', 'osmo', 'huahua', 'inj'];

export const IBC_MINIMAL_MAP: {
    [key: string]: string;
} = {
    'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477': 'uatom',
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': 'uatom',
    'ibc/51A818D8BBC385C152415882286C62169C05498B8EBCFB38310B1367583860FF': 'uhuahua',
    'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23': 'uosmo',
    'ibc/110A26548C514042AFDDEB1D4B46E71C1D43D9672659A3C958D7365FEECD9388': 'uinj',
};

export const SPECIFIC_DENOM_DECIMALS: {
    [key: string]: number;
} = {
    inj: 18,
};
