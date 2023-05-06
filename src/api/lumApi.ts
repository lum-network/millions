import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';
import { PrizeModel } from 'models';

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

    fetchBiggestPrizes = async () => this.request<PrizeModel[]>({ url: '/millions/prizes/biggest?limit=4', method: 'GET' }, PrizeModel);

    fetchPrizes = async (page = 0) => this.request<PrizeModel[]>({ url: `/millions/prizes?limit=5&page=${page}`, method: 'GET' }, PrizeModel);

    fetchBiggestPrizesByDenom = async (page = 0, denom: string) => this.request<PrizeModel[]>({ url: `/millions/prizes/biggest/${denom}?limit=5&page=${page}`, method: 'GET' }, PrizeModel);
}

export default LumApi.getInstance();
