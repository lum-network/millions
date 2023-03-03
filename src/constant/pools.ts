import { PoolModel } from 'models';

export const POOLS: {
    [key: string]: PoolModel;
    atom: PoolModel;
    juno: PoolModel;
    osmo: PoolModel;
} = {
    atom: {
        rpc: 'https://rpc-cosmos.imperator.co',
        chainId: 'cosmoshub-4',
        denom: 'atom',
        minimalDenom: 'uatom',
        chainName: 'Cosmos Hub',
        ibcSourceChannel: 'channel-3',
        ibcDestChannel: 'channel-115',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
    juno: {
        rpc: 'https://rpc-juno.imperator.co',
        chainId: 'juno-1',
        denom: 'juno',
        minimalDenom: 'ujuno',
        chainName: 'Juno',
        ibcSourceChannel: 'channel-3',
        ibcDestChannel: 'channel-115',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
    osmo: {
        rpc: 'https://rpc-osmosis.imperator.co',
        chainId: 'osmosis-1',
        denom: 'osmo',
        minimalDenom: 'uosmo',
        chainName: 'Osmosis',
        ibcSourceChannel: 'channel-3',
        ibcDestChannel: 'channel-115',
        ibcDenom: 'ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23',
    },
};
