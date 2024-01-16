import { Coin } from '@lum-network/sdk-javascript';

export interface TransactionModel {
    messages: string[];
    hash: string;
    height: number;
    amount: Coin[];
    memo?: string;
    success?: boolean;
    [key: string]: string | Coin[] | number | boolean | string[] | undefined;
}
