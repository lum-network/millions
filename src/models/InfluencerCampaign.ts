import { Coin } from '@lum-network/sdk-javascript';
import { Expose, Type } from 'class-transformer';
import InfluencerCampaignMember from './InfluencerCampaignMember';

class InfluencerCampaign {
    @Expose()
    id!: string;

    @Expose()
    username!: string;

    @Expose()
    name!: string;

    @Expose()
    image!: string;

    @Expose()
    drops!: number;

    @Expose()
    amount!: Coin;

    @Expose({ name: 'start_at' })
    startAt!: Date;

    @Expose({ name: 'end_at' })
    endAt!: Date;

    @Expose({ name: 'pool_id' })
    poolId!: number;

    @Expose()
    password!: string;

    @Expose()
    @Type(() => InfluencerCampaignMember)
    members!: InfluencerCampaignMember[];
}

export default InfluencerCampaign;
