import { LumTypes, LumWallet } from '@lum-network/sdk-javascript';
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
        pagesLoaded: number;
    };
    deposits: AggregatedDepositModel[];
    prizes: PrizeModel[];
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
