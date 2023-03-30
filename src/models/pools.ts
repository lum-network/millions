import { Pool } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/pool';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';

export interface PoolInternalInfosModel {
    rpc: string;
    chainName: string;
    ibcSourceChannel: string;
    ibcDenom: string;
}

export interface PoolModel extends Pool {
    internalInfos?: PoolInternalInfosModel;
    prizes?: Prize[];
}
