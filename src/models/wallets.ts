import { LumTypes, LumWallet } from '@lum-network/sdk-javascript-legacy';
import { AggregatedDepositModel } from './deposit';
import { TransactionModel } from './transaction';
import PrizeModel from './Prize';

export interface LumWalletModel {
    innerWallet: LumWallet;
    address: string;
    balances: LumTypes.Coin[];
    activities: {
        result: TransactionModel[];
        currentPage: number;
        pagesTotal: number;
    };
    deposits: AggregatedDepositModel[];
    prizes: PrizeModel[];
    totalPrizesWon: { [denom: string]: number };
    isLedger: boolean;
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
