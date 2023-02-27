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

    getTokenPrice = async (denom: string) =>
        this.request<TokenModel[]>(
            {
                url: '/tokens/v2/' + denom,
                method: 'GET',
            },
            TokenModel,
        );
}

export default ImperatorApi.getInstance();
