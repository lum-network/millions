import { Deposit as MillionsDeposit } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/deposit';
import { WithdrawalState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/withdrawal';
import Long from 'long';

export interface DepositModel extends MillionsDeposit {
    withdrawalId?: Long;
    isWithdrawing?: boolean;
    isDepositDrop?: boolean;
    unbondingEndAt?: Date;
    withdrawalState?: WithdrawalState;
    withdrawalCanBeRetried?: boolean;
}

export interface AggregatedDepositModel extends Partial<DepositModel> {
    deposits: Partial<DepositModel>[];
}
