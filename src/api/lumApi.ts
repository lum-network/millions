import { HttpClient } from 'utils';
import { ApiConstants } from 'constant';
import { DepositDropModel, LeaderboardItemModel, PrizeModel, PrizeStatsModel, BiggestAprPrizeModel, InfluencerCampaignModel } from 'models';

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

    fetchCampaigns = async () => this.request<InfluencerCampaignModel[]>({ url: '/millions/campaigns', method: 'GET' }, InfluencerCampaignModel);

    participateForCampaign = async (campaignId: string, address: string, password: string) =>
        this.request<InfluencerCampaignModel>(
            {
                url: '/millions/campaigns/participate',
                method: 'POST',
                data: {
                    campaign_id: campaignId,
                    wallet_address: address,
                    password,
                },
            },
            InfluencerCampaignModel,
        );
}

export default LumApi.getInstance();
