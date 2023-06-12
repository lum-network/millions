import { Pool } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/pool';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { BalanceModel } from './index';
import { Draw } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/draw';

export interface PoolInternalInfosModel {
    rpc: string;
    chainName: string;
    ibcSourceChannel: string;
    ibcTestnetSourceChannel: string;
    ibcDenom: string;
    ibcTestnetDenom: string;
    unbondingTime: number;
    fees: number;
    illustration?: string;
}

export interface PoolModel extends Pool {
    internalInfos?: PoolInternalInfosModel;
    prizes?: Prize[];
    draws?: Draw[];
    nextDrawAt?: Date;
    prizeToWin: BalanceModel | null;
    apy: number;
}
