import { LumConstants, LumTypes, LumWallet } from '@lum-network/sdk-javascript';
import numeral from 'numeral';
import { getNormalDenom } from './denoms';
import { convertUnitNumber } from './numbers';
import { Message } from '@lum-network/sdk-javascript/build/messages';

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

export const getMaxAmount = (denom?: string, balances?: LumTypes.Coin[]) => {
    if (!denom || !balances) {
        return '0';
    }

    const balance = balances?.find((b) => b.denom === denom);

    if (balance) {
        const amount = convertUnitNumber(balance.amount);
        return numeral(amount).format('0,0.[000000]');
    }

    return '0';
};

export const buildTxFee = (fee: string, gas: string): Fee => {
    return {
        amount: [
            {
                amount: fee,
                denom: LumConstants.MicroLumDenom,
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

    const balanceChanged = currentBalance.some((balance) => {
        const newBalanceAmount = newBalance.find((b) => b.denom === balance.denom)?.amount;

        return newBalanceAmount !== balance.amount;
    });

    return balanceChanged;
};
