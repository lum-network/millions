import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';
import { DepositDropModel, LeaderboardItemModel, PrizeModel, PrizeStatsModel, BiggestAprPrizeModel } from 'models';

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

    fetchBiggestAprPrizes = async () => this.request<BiggestAprPrizeModel[]>({ url: '/millions/prizes/biggest-apr?limit=30', method: 'GET' }, BiggestAprPrizeModel);

    fetchPrizes = async (page = 0) => this.request<PrizeModel[]>({ url: `/millions/prizes?limit=5&page=${page}`, method: 'GET' }, PrizeModel);

    fetchPrizesByAddress = async (address: string, page = 0) => this.request<PrizeModel[]>({ url: `/millions/prizes/address/${address}?limit=5000&page=${page}`, method: 'GET' }, PrizeModel);

    fetchBiggestPrizesByPoolId = async (page = 0, poolId: string) => this.request<PrizeModel[]>({ url: `/millions/prizes/biggest/${poolId}?limit=5&page=${page}`, method: 'GET' }, PrizeModel);

    getPrizesStats = async (poolId: string) => this.request<PrizeStatsModel>({ url: `/millions/prizes/stats/${poolId}`, method: 'GET' }, PrizeStatsModel);

    fetchDepositsDrops = async (address: string, page = 0) => this.request<DepositDropModel[]>({ url: `/millions/deposits/drops/${address}?limit=10&page=${page}`, method: 'GET' }, DepositDropModel);

    fetchLeaderboard = async (poolId: string, limit = 5, page = 0) =>
        this.request<LeaderboardItemModel[]>({ url: `/millions/depositors/${poolId}?limit=${limit}&page=${page}`, method: 'GET' }, LeaderboardItemModel);

    fetchLeaderboardUserRank = async (poolId: string, address: string) =>
        this.request<LeaderboardItemModel[]>({ url: `/millions/depositors/${poolId}/${address}`, method: 'GET' }, LeaderboardItemModel);
}

export default LumApi.getInstance();
