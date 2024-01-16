import { OfflineSigner } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import dayjs from 'dayjs';
import { I18n, WalletUtils } from 'utils';
import { showErrorToast } from './toast';
import { ApiConstants } from 'constant';
import { Coin } from '@keplr-wallet/types';
import { cosmos, fromAscii, getSigningIbcClient } from '@lum-network/sdk-javascript';

class WalletClient {
    private chainId: string | null = null;

    private walletClient: SigningStargateClient | null = null;
    private queryClient: Awaited<ReturnType<typeof cosmos.ClientFactory.createRPCQueryClient>> | null = null;

    // Utils

    connect = async (rpc: string, offlineSigner?: OfflineSigner, silent?: boolean) => {
        try {
            if (!rpc) {
                throw new Error('no rpc provided');
            }

            const { createRPCQueryClient } = cosmos.ClientFactory;
            const queryClient = await createRPCQueryClient({ rpcEndpoint: rpc });

            if (offlineSigner) {
                this.walletClient = await getSigningIbcClient({
                    rpcEndpoint: rpc,
                    signer: offlineSigner,
                });
            }

            this.queryClient = queryClient;
            this.chainId = (await queryClient.cosmos.base.tendermint.v1beta1.getNodeInfo()).nodeInfo?.network || 'lum-network-1';
        } catch (e) {
            if (!silent) showErrorToast({ content: I18n.t('errors.client.rpc') });
            throw e;
        }
    };

    disconnect = () => {
        if (this.walletClient) {
            this.walletClient.disconnect();
            this.walletClient = null;
            this.queryClient = null;
            this.chainId = null;
        }
    };

    // Getters

    getChainId = () => {
        return this.chainId;
    };

    getWalletBalance = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        const { balances } = await this.queryClient.cosmos.bank.v1beta1.allBalances({ address });

        return {
            balances,
        };
    };

    getIcaAccountBankBalance = async (address: string, denom: string) => {
        if (this.queryClient === null) {
            return null;
        }

        return (await this.queryClient.cosmos.bank.v1beta1.balance({ address, denom })).balance;
    };

    getIcaAccountStakingRewards = async (address: string) => {
        if (this.queryClient === null) {
            return null;
        }

        return this.queryClient.cosmos.distribution.v1beta1.delegationTotalRewards({ delegatorAddress: address });
    };

    getBonding = async () => {
        if (this.queryClient === null) {
            return null;
        }

        return Number((await this.queryClient.cosmos.staking.v1beta1.pool()).pool?.bondedTokens);
    };

    getSupply = async (denom: string) => {
        if (this.queryClient === null) {
            return null;
        }

        return Number((await this.queryClient.cosmos.bank.v1beta1.supplyOf({ denom }))?.amount?.amount);
    };

    getCommunityTaxRate = async () => {
        if (this.queryClient === null) {
            return null;
        }

        return Number((await this.queryClient.cosmos.distribution.v1beta1.params()).params?.communityTax) / ApiConstants.CLIENT_PRECISION;
    };

    getInflation = async () => {
        if (this.queryClient === null) {
            return null;
        }

        const inflation = fromAscii((await this.queryClient.cosmos.mint.v1beta1.inflation()).inflation);

        return Number(inflation) / ApiConstants.CLIENT_PRECISION;
    };

    // Operations

    ibcTransfer = async (fromWallet: string, toAddress: string, amount: Coin, channel: string, feesDenom: string) => {
        if (this.walletClient === null) {
            return null;
        }

        const fee = WalletUtils.buildTxFee('25000', '500000', feesDenom);
        const res = await this.walletClient.sendIbcTokens(fromWallet, toAddress, amount, 'transfer', channel, undefined, dayjs().utc().add(5, 'minutes').unix().valueOf(), fee);

        return {
            hash: res.transactionHash,
            error: res.code !== 0 ? res.rawLog : null,
        };
    };
}

export default WalletClient;
