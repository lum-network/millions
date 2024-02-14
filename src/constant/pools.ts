import Assets from 'assets';
import { PoolInternalInfosModel } from 'models';

export const POOLS: {
    [key: string]: PoolInternalInfosModel;
    atom: PoolInternalInfosModel;
} = {
    atom: {
        rpc: process.env.REACT_APP_RPC_ATOM || 'https://rpc.cosmoshub.strange.love/',
        chainName: 'Cosmos Hub',
        ibcSourceChannel: 'channel-566',
        ibcTestnetSourceChannel: 'channel-0',
        ibcDenom: 'ibc/A8C2D23A1E6F95DA4E48BA349667E322BD7A6C996D8A4AAE8BA72E190F3D1477',
        ibcTestnetDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        unbondingTime: 21,
        fees: 0.025,
        illustration: Assets.chains.atomIllustration,
    },
};

export const USED_CHAIN_IDS = ['cosmoshub-4', 'lum-network-1', 'gaia-devnet', 'lum-network-testnet-2'];
