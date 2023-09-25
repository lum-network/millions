import { LumConstants, LumTypes, LumWallet } from '@lum-network/sdk-javascript';
import { getNormalDenom } from './denoms';
import { convertUnitNumber } from './numbers';
import { Message } from '@lum-network/sdk-javascript/build/messages';
import { AggregatedDepositModel } from 'models';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/deposit';

type Fee = { amount: { amount: string; denom: string }[]; gas: string };

export const getTotalBalance = (balances: LumTypes.Coin[], prices: { [denom: string]: number }) => {
    let totalBalance = 0;
    let missingPrice = false;

    balances.forEach((balance) => {
        const price = Object.entries(prices).find((price) => price[0] === getNormalDenom(balance.denom));
        const convertedAmount = convertUnitNumber(balance.amount);

        if (price) {
            totalBalance += convertedAmount * price[1];
        } else {
            missingPrice = true;
        }
    });

    return missingPrice ? null : totalBalance;
};

/**
 * Returns a total balance from deposits.
 *
 * @param deposits - A list of aggregated deposits
 * @param prices - A map of prices (can be optional, if optional crypto total amount is returned otherwise fiat total amount is returned)
 * @returns The total balance from deposits
 *
 */
export const getTotalBalanceFromDeposits = (deposits: AggregatedDepositModel[] | undefined, prices?: { [denom: string]: number }) => {
    let totalBalance = 0;
    let missingPrice = false;

    if (!deposits) {
        return null;
    }

    deposits
        .filter((deposit) => deposit.state === DepositState.DEPOSIT_STATE_SUCCESS)
        .forEach((deposit) => {
            const price = prices ? Object.entries(prices).find((price) => price[0] === getNormalDenom(deposit.amount?.denom || '')) : null;
            const convertedAmount = convertUnitNumber(deposit.amount?.amount || '0');

            if (prices && !price) {
                missingPrice = true;
            } else {
                if (price) {
                    totalBalance += convertedAmount * price[1];
                } else {
                    totalBalance += convertedAmount;
                }
            }
        });

    return missingPrice ? null : totalBalance;
};

export const getMaxAmount = (denom?: string, balances?: LumTypes.Coin[], feesAmount?: number) => {
    if (!denom || !balances) {
        return '0';
    }

    const balance = balances?.find((b) => b.denom === denom);

    if (balance) {
        let amount = convertUnitNumber(balance.amount);

        if (feesAmount) {
            amount -= feesAmount;
        }

        if (amount < 0) {
            return '0';
        }

        return amount.toFixed(6);
    }

    return '0';
};

export const buildTxFee = (fee: string, gas: string, denom = LumConstants.MicroLumDenom): Fee => {
    return {
        amount: [
            {
                amount: fee,
                denom,
            },
        ],
        gas,
    };
};

export const buildTxDoc = (fee: Fee, wallet: LumWallet, messages: Message[], chainId: string | null, account: LumTypes.Account | null): LumTypes.Doc | null => {
    if (!account || !chainId) {
        return null;
    }

    const { accountNumber, sequence } = account;

    return {
        chainId,
        fee,
        memo: '',
        messages,
        signers: [
            {
                accountNumber,
                sequence,
                publicKey: wallet.getPublicKey(),
            },
        ],
    };
};

export const updatedBalances = (currentBalance?: LumTypes.Coin[], newBalance?: LumTypes.Coin[]) => {
    if (!currentBalance || !newBalance) {
        return false;
    }

    if (currentBalance.length !== newBalance.length) {
        return true;
    }

    return currentBalance.some((balance) => {
        const newBalanceAmount = newBalance.find((b) => b.denom === balance.denom)?.amount;

        return newBalanceAmount !== balance.amount;
    });
};
