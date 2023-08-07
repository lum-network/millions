import { Deposit as MillionsDeposit } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/deposit';
import { WithdrawalState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/withdrawal';

export interface DepositModel extends MillionsDeposit {
    isWithdrawing?: boolean;
    isDepositDrop?: boolean;
    unbondingEndAt?: Date;
    withdrawalState?: WithdrawalState;
}

export interface AggregatedDepositModel extends Partial<DepositModel> {
    deposits: Partial<DepositModel>[];
}
