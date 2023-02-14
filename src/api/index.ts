import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';

class Api extends HttpClient {
    private static instance?: Api;

    private constructor() {
        super(ApiConstants.BASE_URL);
    }

    public static getInstance(): Api {
        if (!this.instance) {
            this.instance = new Api();
        }

        return this.instance;
    }
}

export default Api.getInstance();
