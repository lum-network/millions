export interface PoolModel {
    rpc: string;
    chainId: string;
    denom: string;
    minimalDenom: string;
    chainName: string;
    ibcSourceChannel: string;
    ibcDestChannel: string;
    ibcDenom: string;
}
