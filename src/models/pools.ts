import { BalanceModel, LeaderboardItemModel } from './index';
import { Pool } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/pool';
import { Draw } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/draw';
import { Prize } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/prize';

export interface DrawModel extends Draw {
    usdTokenValue?: number;
}

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
    draws?: DrawModel[];
    nextDrawAt?: Date;
    leaderboard: {
        items: LeaderboardItemModel[];
        page: number;
        fullyLoaded: boolean;
    };
    currentPrizeToWin: BalanceModel | null;
    estimatedPrizeToWin: BalanceModel | null;
    apy: number;
}
