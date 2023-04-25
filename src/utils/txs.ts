import { LumConstants, LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { TransactionModel } from 'models';
import Long from 'long';
import { getDenomFromIbc } from './denoms';
import { NumbersUtils } from 'utils';

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
        poolId?: Long.Long;
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

    const claimEvent = logs[index]?.events.find((ev: any) => ev.type === event);

    if (!claimEvent) {
        return [];
    } else {
        const amount = claimEvent.attributes.find((attr: any) => attr.key === 'amount');
        if (!amount) {
            return [];
        } else {
            const denom = amount.value.match(amount.value.includes('ibc') ? /(ibc\/.+)/g : /\D+/g)[0];
            return [{ denom: await getDenomFromIbc(denom), amount: amount.value.replace(denom, '') }];
        }
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
                                if (txInfos.amount.denom.startsWith('ibc/')) {
                                    txInfos.amount.denom = await getDenomFromIbc(txInfos.amount.denom);
                                }
                                tx.amount = [txInfos.amount];
                            } else if (isMillionsWithdrawDeposit(txInfos)) {
                                const logs = JSON.parse(rawTx.result.log || '');
                                tx.amount = await findAmountInLogs(logs, 'withdraw_deposit', index);
                            } else if (isMillionsClaimPrize(txInfos)) {
                                const logs = JSON.parse(rawTx.result.log || '');

                                if (tx.amount.length > 0) {
                                    const msgAmount = await findAmountInLogs(logs, 'prize_claim', index);
                                    const prevAmountNumber = NumbersUtils.convertUnitNumber(tx.amount[0].amount);
                                    const msgAmountNumber = NumbersUtils.convertUnitNumber(msgAmount[0].amount);

                                    const amount = NumbersUtils.convertUnitNumber(prevAmountNumber + msgAmountNumber, LumConstants.LumDenom, LumConstants.MicroLumDenom).toFixed();

                                    tx.amount = [
                                        {
                                            amount,
                                            denom: tx.amount[0].denom,
                                        },
                                    ];
                                } else {
                                    tx.amount = await findAmountInLogs(logs, 'prize_claim', index);
                                }
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
