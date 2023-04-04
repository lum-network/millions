import { LumTypes, LumWallet } from '@lum-network/sdk-javascript';
import { DepositModel } from './deposit';

export interface LumWalletModel {
    innerWallet: LumWallet;
    address: string;
    balances: LumTypes.Coin[];
    activities: any[];
    deposits: DepositModel[];
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
