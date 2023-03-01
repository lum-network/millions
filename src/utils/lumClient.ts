import { LumClient as Client, LumConstants, LumTypes, LumUtils } from '@lum-network/sdk-javascript';

class LumClient {
    private static instance: LumClient | null = null;
    private rpc: string = process.env.REACT_APP_RPC_URL ?? '';
    private client: Client | null = null;
    private chainId: string | null = null;

    static get Instance() {
        if (!LumClient.instance) {
            LumClient.instance = new LumClient();
        }

        return LumClient.instance;
    }

    getChainId = () => {
        return this.chainId;
    };

    getRpc = () => {
        return this.rpc;
    };

    connect = async () => {
        if (this.client) {
            return;
        }

        try {
            const client = await Client.connect(this.rpc);
            this.client = client;
            this.chainId = await client.getChainId();
        } catch (e) {
            throw e as Error;
        }
    };

    getWalletBalances = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const balances = await this.client.getAllBalances(address);

        return { balances };
    };

    getWalletActivites = async (address: string) => {
        if (this.client === null) {
            return null;
        }

        const activities = await Promise.resolve([]);

        return { activities };
    };

    getDenomTrace = async (ibcDenom: string) => {
        if (this.client === null) {
            return null;
        }

        const denomTrace = await this.client.queryClient.ibc.transfer.denomTrace(ibcDenom);

        return denomTrace;
    };

    depositToPool = async (pool: string, amount: string) => {
        if (this.client === null) {
            return null;
        }

        // Update with tx hash
        return 'IZAONZOINAOINAAIDNOINAOINAOBAOSUAOI';
    };
}

export default LumClient.Instance;
