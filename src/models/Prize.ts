import { Exclude, Expose, Type } from 'class-transformer';
import { BalanceModel } from './index';

@Exclude()
class PrizeModel {
    @Expose()
    id!: string;

    @Expose({ name: 'draw_id' })
    drawId!: number;

    @Expose({ name: 'pool_id' })
    poolId!: number;

    @Expose({ name: 'prize_id' })
    prizeId!: number;

    @Expose({ name: 'winner_address' })
    winnerAddress!: string;

    @Expose({ name: 'created_at_height' })
    createdAtHeight!: number;

    @Expose({ name: 'updated_at_height' })
    updatedAtHeight!: number;

    @Expose()
    @Type(() => BalanceModel)
    amount!: BalanceModel;

    @Expose({ name: 'usd_token_value' })
    usdTokenValue!: number;

    @Expose({ name: 'expires_at' })
    expiresAt?: Date;

    @Expose({ name: 'created_at' })
    createdAt?: Date;

    @Expose({ name: 'updated_at' })
    updatedAt?: Date;
}

export default PrizeModel;
