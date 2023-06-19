import Assets from 'assets';
import { LumConstants, LumMessages, LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { Any } from '@lum-network/sdk-javascript/build/codec/google/protobuf/any';
import { TransactionModel } from 'models';
import Long from 'long';
import { I18n, NumbersUtils } from 'utils';

import { getDenomFromIbc } from './denoms';

type MillionsTxInfos = {
    amount: LumTypes.Coin;
};

type MillionsWithdrawDeposit = {
    toAddress: string;
};

type MillionsClaimPrize = {
    winnerAddress: string;
};

export const isMillionsDepositTx = (
    info: {
        amount?: LumTypes.Coin;
        depositorAddress?: string;
        winnerAddress?: string;
        isSponsor?: boolean;
        poolId?: Long;
    } | null,
): info is MillionsTxInfos => {
    return !!(info && info.amount && info.depositorAddress && info.isSponsor !== undefined && info.poolId);
};

export const isMillionsWithdrawDeposit = (info: { toAddress?: string; depositorAddress?: string } | null): info is MillionsWithdrawDeposit => {
    return !!(info && info.toAddress && info.depositorAddress);
};

export const isMillionsClaimPrize = (info: { winnerAddress?: string } | null): info is MillionsClaimPrize => {
    return !!(info && info.winnerAddress);
};

export const hashExists = (txs: TransactionModel[], hash: string): boolean => txs.findIndex((tx) => tx.hash === hash) > -1;

export const findAmountInLogs = async (logs: any, event: string, index: number) => {
    if (!Array.isArray(logs)) {
        return [];
    }

    const e = logs[index]?.events.find((ev: any) => ev.type === event);

    if (!e) {
        return [];
    } else {
        const amount = e.attributes.find((attr: any) => attr.key === 'amount');
        if (!amount) {
            return [];
        } else {
            const denom = amount.value.match(amount.value.includes('ibc') ? /(ibc\/.+)/g : /\D+/g)[0];
            return [{ denom: await getDenomFromIbc(denom), amount: amount.value.replace(denom, '') }];
        }
    }
};

export const parseLogs = async (tx: TransactionModel, msg: Any, index: number, logs: any, event: string, formattedTxs: TransactionModel[]) => {
    if (tx.amount.length > 0) {
        const msgAmount = await findAmountInLogs(logs, event, index);
        const msgAmountNumber = NumbersUtils.convertUnitNumber(msgAmount[0].amount);

        const existingDenomIndex = tx.amount.findIndex((amount) => amount.denom === msgAmount[0].denom);

        if (existingDenomIndex > -1) {
            const prevAmountNumber = NumbersUtils.convertUnitNumber(tx.amount[0].amount);
            const amount = NumbersUtils.convertUnitNumber(prevAmountNumber + msgAmountNumber, LumConstants.LumDenom, LumConstants.MicroLumDenom).toFixed();
            tx.amount[existingDenomIndex].amount = amount;
        } else {
            const existingTx = formattedTxs.find((formattedTx) => formattedTx.hash === tx.hash && formattedTx.height === tx.height);

            tx.messages.splice(0, 1);

            if (!existingTx) {
                formattedTxs.push({
                    hash: tx.hash,
                    height: tx.height,
                    messages: [msg.typeUrl],
                    amount: [
                        {
                            denom: await getDenomFromIbc(msgAmount[0].denom),
                            amount: msgAmount[0].amount,
                        },
                    ],
                });
            } else {
                const prevAmountNumber = NumbersUtils.convertUnitNumber(existingTx.amount[0].amount);
                const amount = NumbersUtils.convertUnitNumber(prevAmountNumber + msgAmountNumber, LumConstants.LumDenom, LumConstants.MicroLumDenom).toFixed();

                existingTx.amount = [
                    {
                        denom: existingTx.amount[0].denom,
                        amount,
                    },
                ];
            }
        }
    } else {
        tx.amount = await findAmountInLogs(logs, event, index);
    }
};

export const formatTxs = async (rawTxs: readonly LumTypes.TxResponse[] | LumTypes.TxResponse[], desc = false): Promise<TransactionModel[]> => {
    const formattedTxs: TransactionModel[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human-readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);
        const hash = LumUtils.toHex(rawTx.hash).toUpperCase();

        if (hashExists(formattedTxs, hash)) {
            continue;
        }

        const height = rawTx.height;

        const tx: TransactionModel = {
            hash,
            height,
            messages: [],
            amount: [],
        };

        if (txData.body && txData.body.messages) {
            for (const [index, msg] of txData.body.messages.entries()) {
                try {
                    const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));

                    if (typeof txInfos === 'object') {
                        tx.messages.push(msg.typeUrl);

                        if (msg.typeUrl.includes('millions')) {
                            if (isMillionsDepositTx(txInfos)) {
                                const logs = LumUtils.parseRawLogs(rawTx.result.log);

                                await parseLogs(tx, msg, index, logs, 'deposit', formattedTxs);
                            } else if (isMillionsWithdrawDeposit(txInfos)) {
                                const logs = LumUtils.parseRawLogs(rawTx.result.log);

                                tx.amount = await findAmountInLogs(logs, 'withdraw_deposit', index);
                            } else if (isMillionsClaimPrize(txInfos)) {
                                const logs = LumUtils.parseRawLogs(rawTx.result.log);

                                await parseLogs(tx, msg, index, logs, 'prize_claim', formattedTxs);
                            }
                        }
                    }
                } catch {}
            }
            formattedTxs.push(tx);
        }
    }

    if (desc) {
        return sortByBlockHeightDesc(formattedTxs);
    }

    return sortByBlockHeight(formattedTxs);
};

export const sortByBlockHeight = (txs: TransactionModel[]): TransactionModel[] => txs.sort((txA, txB) => txA.height - txB.height);
export const sortByBlockHeightDesc = (txs: TransactionModel[]): TransactionModel[] => txs.sort((txA, txB) => txB.height - txA.height);

export const getTxTypeAndIcon = (transaction: TransactionModel) => {
    let type = '';
    let icon = '';

    switch (transaction.messages[0]) {
        case LumMessages.MsgMillionsDepositUrl:
            type = I18n.t('mySavings.transactionTypes.deposit');
            icon = Assets.images.deposit;
            break;
        case LumMessages.MsgWithdrawDepositUrl:
            type = I18n.t('mySavings.transactionTypes.leavePool');
            icon = Assets.images.leavePool;
            break;
        case LumMessages.MsgClaimPrizeUrl:
            type = I18n.t('mySavings.transactionTypes.claimPrize');
            icon = Assets.images.trophyPurple;
            break;
    }

    return {
        type,
        icon,
    };
};
