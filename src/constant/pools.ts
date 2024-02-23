import Assets from 'assets';
import { PoolInternalInfosModel } from 'models';

export const POOLS: {
    [key: string]: PoolInternalInfosModel;
    atom: PoolInternalInfosModel;
} = {
    atom: {
        rpc: process.env.REACT_APP_RPC_ATOM ?? 'https://rpc.cosmoshub.strange.love',
        chainName: 'Cosmos Hub',
        ibcSourceChannel: 'channel-566',
        ibcTestnetSourceChannel: 'channel-0',
        ibcDenom: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
        ibcTestnetDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        unbondingTime: 21,
        fees: 0.025,
        illustration: Assets.chains.atomIllustration,
    },
    huahua: {
        rpc: process.env.REACT_APP_RPC_HUAHUA ?? 'https://chihuahua-rpc.publicnode.com:443',
        chainName: 'Chihuahua',
        ibcSourceChannel: 'channel-81',
        ibcTestnetSourceChannel: 'channel-0',
        ibcDenom: 'ibc/51A818D8BBC385C152415882286C62169C05498B8EBCFB38310B1367583860FF',
        ibcTestnetDenom: 'ibc/51A818D8BBC385C152415882286C62169C05498B8EBCFB38310B1367583860FF',
        unbondingTime: 21,
        fees: 1250,
        illustration: Assets.chains.huahuaIllustration,
    },
    osmo: {
        rpc: process.env.REACT_APP_RPC_OSMO ?? 'https://private-rpc-cm-osmosis.imperator.co',
        chainName: 'Osmosis',
        ibcSourceChannel: 'channel-115',
        ibcTestnetSourceChannel: 'channel-0',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
        ibcTestnetDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
        unbondingTime: 14,
        fees: 0.025,
        illustration: Assets.chains.osmoIllustration,
    },
};

export const USED_CHAIN_IDS = ['cosmoshub-4', 'lum-network-1', 'chihuahua-1', 'osmosis-1'];
