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
        ibcSourceChannel: 'channel-3',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
    juno: {
        rpc: 'https://rpc-juno.imperator.co',
        chainName: 'Juno',
        ibcSourceChannel: 'channel-3',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
    osmo: {
        rpc: 'https://rpc-osmosis.imperator.co',
        chainName: 'Osmosis',
        ibcSourceChannel: 'channel-3',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
};
