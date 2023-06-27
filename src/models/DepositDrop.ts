import { Exclude, Expose } from 'class-transformer';

@Exclude()
class DepositDrop {
    @Expose({ name: 'id' })
    depositId!: number;

    @Expose()
    amount?: {
        amount: string;
        denom: string;
    };

    @Expose({ name: 'pool_id' })
    poolId!: number;

    @Expose({ name: 'depositor_address' })
    depositorAddress!: string;

    @Expose({ name: 'winner_address' })
    winnerAddress!: string;

    @Expose({ name: 'is_sponsor' })
    isSponsor!: boolean;
}

export default DepositDrop;
