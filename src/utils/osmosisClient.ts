import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Coin } from '@lum-network/sdk-javascript/build/types';
import { OSMOSIS_RPC } from 'constant';
import dayjs from 'dayjs';
import { I18n } from 'utils';
import Long from 'long';
import { showErrorToast } from './toast';

class OsmosisClient {
    chainId: string | null = null;

    private osmosisClient: SigningStargateClient | null = null;
    private static instance: OsmosisClient;

    static get Instance() {
        if (!OsmosisClient.instance) {
            OsmosisClient.instance = new OsmosisClient();
        }

        return OsmosisClient.instance;
    }

    // Utils

    connect = async (offlineSigner: OfflineSigner) => {
        try {
            const client = await SigningStargateClient.connectWithSigner(OSMOSIS_RPC, offlineSigner);
            this.osmosisClient = client;
            this.chainId = await client.getChainId();
        } catch {
            showErrorToast({ content: I18n.t('errors.client.osmosis') });
        }
    };

    disconnect = () => {
        if (this.osmosisClient) {
            this.osmosisClient.disconnect();
            this.osmosisClient = null;
            this.chainId = null;
        }
    };

    // Getters

    getWalletBalance = async (address: string) => {
        if (this.osmosisClient === null) {
            return null;
        }

        const balances = await this.osmosisClient.getAllBalances(address);

        return {
            balances,
        };
    };

    // Operations

    ibcTransfer = async (fromWallet: string, toAddress: string, amount: Coin) => {
        if (this.osmosisClient) {
            const res = await this.osmosisClient.sendIbcTokens(
                fromWallet,
                toAddress,
                amount,
                'transfer',
                'channel-115',
                {
                    revisionHeight: Long.fromNumber(0),
                    revisionNumber: Long.fromNumber(0),
                },
                dayjs().utc().add(5, 'minutes').unix().valueOf(),
                {
                    amount: [],
                    gas: '200000',
                },
            );

            return {
                hash: res.transactionHash,
                error: res.code !== 0 ? res.rawLog : undefined,
            };
        }

        return null;
    };
}

export default OsmosisClient.Instance;
