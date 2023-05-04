import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';
import { PoolRewardsModel } from 'models';

class LumApi extends HttpClient {
    private static instance?: LumApi;

    private constructor() {
        super(ApiConstants.API_URL, 'result');
    }

    public static getInstance(): LumApi {
        if (!this.instance) {
            this.instance = new LumApi();
        }

        return this.instance;
    }

    getPoolsRewards = async () =>
        this.request<PoolRewardsModel[]>(
            {
                url: '/millions/pools/outstanding-prize',
                method: 'GET',
            },
            PoolRewardsModel,
        );
}

export default LumApi.getInstance();
