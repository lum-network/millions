import { Deposit as MillionsDeposit } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

export interface DepositModel extends MillionsDeposit {
    isWithdrawing?: boolean;
    unbondingEndAt?: Date;
}

export interface AggregatedDepositModel extends Partial<DepositModel> {
    deposits: Partial<DepositModel>[];
}
