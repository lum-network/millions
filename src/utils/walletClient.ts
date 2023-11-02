import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { Tendermint37Client } from '@cosmjs/tendermint-rpc';
import { Coin } from '@lum-network/sdk-javascript/build/types';
import dayjs from 'dayjs';
import { I18n, WalletUtils } from 'utils';
import Long from 'long';
import { showErrorToast } from './toast';
import { LumClient } from '@lum-network/sdk-javascript';
import { ApiConstants } from 'constant';

const isConnectedWithSigner = (client: LumClient | SigningStargateClient, withSigner: boolean): client is SigningStargateClient => {
    return withSigner;
};

class WalletClient {
    chainId: string | null = null;

    private walletClient: LumClient | SigningStargateClient | null = null;
    private connectedWithSigner = false;

    // Utils

    connect = async (rpc: string, offlineSigner?: OfflineSigner, silent?: boolean) => {
        try {
            if (!rpc) {
                throw new Error('no rpc provided');
            }

            if (offlineSigner) {
                const tmClient = await Tendermint37Client.connect(rpc);
                this.walletClient = await SigningStargateClient.createWithSigner(tmClient, offlineSigner);
            } else {
                this.walletClient = await LumClient.connect(rpc);
            }

            this.connectedWithSigner = !!offlineSigner;
            this.chainId = await this.walletClient.getChainId();
        } catch (e) {
            if (!silent) showErrorToast({ content: I18n.t('errors.client.rpc') });
            throw e;
        }
    };

    disconnect = () => {
        if (this.walletClient) {
            this.walletClient.disconnect();
            this.walletClient = null;
            this.chainId = null;
            this.connectedWithSigner = false;
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

    getIcaAccountBankBalance = async (address: string, denom: string) => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return this.walletClient.queryClient.bank.balance(address, denom);
    };

    getIcaAccountStakingRewards = async (address: string) => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return this.walletClient.queryClient.distribution.delegationTotalRewards(address);
    };

    getBonding = async () => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return Number((await this.walletClient.queryClient.staking.pool()).pool?.bondedTokens);
    };

    getSupply = async (denom: string) => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return Number((await this.walletClient.getSupply(denom))?.amount);
    };

    getCommunityTaxRate = async () => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return Number((await this.walletClient.queryClient.distribution.params()).params?.communityTax) / ApiConstants.CLIENT_PRECISION;
    };

    getInflation = async () => {
        if (!this.walletClient || (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner))) {
            return null;
        }

        return Number(await this.walletClient.queryClient.mint.inflation()) / ApiConstants.CLIENT_PRECISION;
    };

    // Operations
    ibcTransfer = async (fromWallet: string, toAddress: string, amount: Coin, channel: string, feesDenom: string) => {
        if (this.walletClient && isConnectedWithSigner(this.walletClient, this.connectedWithSigner)) {
            const fee = WalletUtils.buildTxFee('25000', '500000', feesDenom);

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
                fee,
            );

            return {
                hash: res.transactionHash,
                error: res.code !== 0 ? res.rawLog : undefined,
            };
        }

        return null;
    };
}

export default WalletClient;
