import { Coin } from '@lum-network/sdk-javascript';

import { AggregatedDepositModel } from './deposit';
import { TransactionModel } from './transaction';
import PrizeModel from './Prize';

export interface LumWalletModel {
    address: string;
    balances: Coin[];
    activities: {
        result: TransactionModel[];
        currentPage: number;
        pagesTotal: number;
    };
    deposits: AggregatedDepositModel[];
    prizes: PrizeModel[];
    totalPrizesWon: { [denom: string]: number };
    depositDrops: AggregatedDepositModel[];
    isLedger: boolean;
}

export interface OtherWalletModel {
    address: string;
    balances: Coin[];
}
