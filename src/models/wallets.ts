import { LumTypes, LumWallet } from '@lum-network/sdk-javascript';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { AggregatedDepositModel } from './deposit';
import { TransactionModel } from './transaction';

export interface LumWalletModel {
    innerWallet: LumWallet;
    address: string;
    balances: LumTypes.Coin[];
    activities: TransactionModel[];
    deposits: AggregatedDepositModel[];
    prizes: Prize[];
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
