import { Expose, Type } from 'class-transformer';

import InfluencerCampaign from './InfluencerCampaign';

class InfluencerCampaignMember {
    @Expose()
    id!: string;

    @Expose({ name: 'campaign_id' })
    campaignId!: string;

    @Expose({ name: 'wallet_address' })
    walletAddress!: string;

    @Expose()
    @Type(() => InfluencerCampaign)
    campaign!: InfluencerCampaign;

    @Expose({ name: 'created_at' })
    createdAt!: Date;

    @Expose({ name: 'updated_at' })
    updatedAt!: Date;
}

export default InfluencerCampaignMember;
