import { LumTypes } from '@lum-network/sdk-javascript';

class InfluencerCampaign {
    id!: string;
    influencer!: {
        name: string;
        username: string;
        picture: string;
    };
    count!: number;
    amount!: LumTypes.Coin;
    startDate!: Date;
    endDate!: Date;
    poolId!: string;
    code!: string;
    hasParticipated!: boolean;
}

export default InfluencerCampaign;
