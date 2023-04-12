import { LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { TransactionModel } from 'models';
import Long from 'long';

type MillionsTxInfos = {
    amount: LumTypes.Coin;
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

export const hashExists = (txs: TransactionModel[], hash: string): boolean => txs.findIndex((tx) => tx.hash === hash) > -1;

export const formatTxs = (rawTxs: readonly LumTypes.TxResponse[] | LumTypes.TxResponse[], desc = false): TransactionModel[] => {
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
            for (const msg of txData.body.messages) {
                try {
                    const txInfos = LumUtils.toJSON(LumRegistry.decode(msg));

                    if (typeof txInfos === 'object') {
                        tx.messages.push(msg.typeUrl);

                        if (msg.typeUrl.includes('millions')) {
                            if (isMillionsDepositTx(txInfos)) {
                                tx.amount = [txInfos.amount];
                                formattedTxs.push(tx);
                            }
                        }
                    }
                } catch {}
            }
        }
    }

    if (desc) {
        return sortByBlockHeightDesc(formattedTxs);
    }

    return sortByBlockHeight(formattedTxs);
};

export const sortByBlockHeight = (txs: TransactionModel[]): TransactionModel[] => txs.sort((txA, txB) => txA.height - txB.height);
export const sortByBlockHeightDesc = (txs: TransactionModel[]): TransactionModel[] => txs.sort((txA, txB) => txB.height - txA.height);