import { LumTypes } from '@lum-network/sdk-javascript-legacy';

export interface TransactionModel {
    messages: string[];
    hash: string;
    height: number;
    amount: LumTypes.Coin[];
    memo?: string;
    success?: boolean;
    [key: string]: string | LumTypes.Coin[] | number | boolean | string[] | undefined;
}
