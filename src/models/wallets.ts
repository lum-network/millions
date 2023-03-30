import { LumTypes, LumWallet } from '@lum-network/sdk-javascript';
import { Deposit } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

export interface LumWalletModel {
    innerWallet: LumWallet;
    address: string;
    balances: LumTypes.Coin[];
    activities: any[];
    deposits: Deposit[];
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
