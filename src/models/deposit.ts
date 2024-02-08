import { Deposit as MillionsDeposit } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';
import { WithdrawalState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/withdrawal';

export interface DepositModel extends MillionsDeposit {
    withdrawalId?: bigint;
    isWithdrawing?: boolean;
    isDepositDrop?: boolean;
    unbondingEndAt?: Date;
    withdrawalState?: WithdrawalState;
    withdrawalCanBeRetried?: boolean;
}

export interface AggregatedDepositModel extends Partial<DepositModel> {
    deposits: Partial<DepositModel>[];
}
