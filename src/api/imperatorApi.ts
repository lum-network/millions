import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';
import { TokenModel } from 'models';

class ImperatorApi extends HttpClient {
    private static instance?: ImperatorApi;

    private constructor() {
        super(ApiConstants.IMPERATOR_API_URL);
    }

    public static getInstance(): ImperatorApi {
        if (!this.instance) {
            this.instance = new ImperatorApi();
        }

        return this.instance;
    }

    getPrices = async () =>
        this.request<TokenModel[]>(
            {
                url: '/tokens/v2/all',
                method: 'GET',
            },
            TokenModel,
        );

    getOsmoApy = async () =>
        this.request<number>(
            {
                url: '/apr/v2/staking',
                method: 'GET',
            },
            Number,
        );
}

export default ImperatorApi.getInstance();
