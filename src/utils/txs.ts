import { LumRegistry, LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { TransactionModel } from 'models';

type MillionsTxInfos = {
    amount: LumTypes.Coin;
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

export const hashExists = (txs: TransactionModel[], hash: string): boolean => txs.findIndex((tx) => tx.hash === hash) > -1;

export const formatTxs = (rawTxs: readonly LumTypes.TxResponse[] | LumTypes.TxResponse[]): TransactionModel[] => {
    const formattedTxs: TransactionModel[] = [];

    for (const rawTx of rawTxs) {
        // Decode TX to human readable format
        const txData = LumRegistry.decodeTx(rawTx.tx);

        console.log(rawTx);
        console.log(txData);
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
                    console.log(txInfos);
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

    return sortByBlockHeight(formattedTxs);
};

export const sortByBlockHeight = (txs: TransactionModel[]): TransactionModel[] => txs.sort((txA, txB) => txA.height - txB.height);
