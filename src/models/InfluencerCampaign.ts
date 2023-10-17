import { LumTypes } from '@lum-network/sdk-javascript';
import { Expose } from 'class-transformer';

class InfluencerCampaign {
    @Expose()
    id!: string;

    @Expose()
    username!: string;

    @Expose()
    image!: string;

    count!: number;
    amount!: LumTypes.Coin;

    @Expose({ name: 'start_at' })
    startAt!: Date;

    @Expose({ name: 'end_at' })
    endAt!: Date;

    @Expose({ name: 'pool_id' })
    poolId!: string;

    @Expose()
    password!: string;
}

export default InfluencerCampaign;
