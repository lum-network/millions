import { Exclude, Expose } from 'class-transformer';

@Exclude()
class BiggestAprPrize {
    @Expose({ name: 'id' })
    address!: string;

    @Expose()
    apr?: number;

    @Expose({ name: 'denom_native' })
    denom!: string;

    @Expose({ name: 'raw_amount' })
    amount!: number;

    @Expose({ name: 'sum_of_deposits' })
    sumOfDeposits!: number;

    @Expose({ name: 'created_at' })
    createdAt?: Date;

    @Expose({ name: 'created_at_height' })
    createdAtHeight!: number;

    @Expose({ name: 'draw_id' })
    drawId!: number;

    @Expose({ name: 'pool_id' })
    poolId!: number;

    @Expose({ name: 'updated_at' })
    updatedAt?: Date;
}

export default BiggestAprPrize;
