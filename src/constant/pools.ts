import Assets from 'assets';
import { PoolInternalInfosModel } from 'models';

export const POOLS: {
    [key: string]: PoolInternalInfosModel;
    atom: PoolInternalInfosModel;
    juno: PoolInternalInfosModel;
    osmo: PoolInternalInfosModel;
} = {
    atom: {
        rpc: process.env.REACT_APP_RPC_ATOM ?? 'https://rpc-cosmos.imperator.co',
        chainName: 'Cosmos Hub',
        ibcSourceChannel: 'channel-0',
        ibcDenom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        unbondingTime: 21,
        fees: 0.005,
        illustration: Assets.chains.atomIllustration,
    },
    juno: {
        rpc: 'https://rpc-juno.imperator.co',
        chainName: 'Juno',
        ibcSourceChannel: 'channel-3',
        unbondingTime: 28,
        fees: 0.005,
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
    osmo: {
        rpc: 'https://rpc-osmosis.imperator.co',
        chainName: 'Osmosis',
        ibcSourceChannel: 'channel-3',
        unbondingTime: 14,
        fees: 0.005,
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
        illustration: Assets.chains.osmoIllustration,
    },
};
