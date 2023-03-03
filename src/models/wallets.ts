import { LumTypes, LumWallet } from '@lum-network/sdk-javascript';

export interface LumWalletModel {
    innerWallet: LumWallet;
    address: string;
    balances: LumTypes.Coin[];
    activities: any[];
}

export interface OtherWalletModel {
    address: string;
    balances: LumTypes.Coin[];
}
