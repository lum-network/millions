import { Exclude, Expose, Type } from 'class-transformer';
import { BalanceModel } from './index';

@Exclude()
export class PoolRewardsModel {
    @Expose()
    id!: number;

    @Expose({ name: 'available_prize_pool' })
    @Type(() => BalanceModel)
    availablePrizePool: BalanceModel = new BalanceModel();

    @Expose({ name: 'outstanding_prize_pool' })
    @Type(() => BalanceModel)
    outstandingPrizePool: BalanceModel = new BalanceModel();

    @Expose({ name: 'sponsorship_amount' })
    sponsorshipAmount!: string;
}
