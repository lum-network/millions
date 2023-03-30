import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Coin } from '@lum-network/sdk-javascript/build/types';
import dayjs from 'dayjs';
import { I18n } from 'utils';
import Long from 'long';
import { showErrorToast } from './toast';

class WalletClient {
    chainId: string | null = null;

    private walletClient: SigningStargateClient | null = null;
    private static instance: WalletClient;

    static get Instance() {
        if (!WalletClient.instance) {
            WalletClient.instance = new WalletClient();
        }

        return WalletClient.instance;
    }

    // Utils

    connect = async (rpc: string, offlineSigner: OfflineSigner) => {
        try {
            const client = await SigningStargateClient.connectWithSigner(rpc, offlineSigner);
            this.walletClient = client;
            this.chainId = await client.getChainId();
        } catch {
            showErrorToast({ content: I18n.t('errors.client.rpc') });
        }
    };

    disconnect = () => {
        if (this.walletClient) {
            this.walletClient.disconnect();
            this.walletClient = null;
            this.chainId = null;
        }
    };

    // Getters

    getWalletBalance = async (address: string) => {
        if (this.walletClient === null) {
            return null;
        }

        const balances = await this.walletClient.getAllBalances(address);

        return {
            balances,
        };
    };

    // Operations

    ibcTransfer = async (fromWallet: string, toAddress: string, amount: Coin, channel: string) => {
        if (this.walletClient) {
            const res = await this.walletClient.sendIbcTokens(
                fromWallet,
                toAddress,
                amount,
                'transfer',
                channel,
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

export default WalletClient.Instance;
