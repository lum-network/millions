import { Expose } from 'class-transformer';

class PrizeStatsModel {
    @Expose({ name: 'biggest_prize_amount' })
    biggestPrizeAmount!: string;

    @Expose({ name: 'total_pool_prizes' })
    totalPoolPrizes!: number;

    @Expose({ name: 'total_prizes_usd_amount' })
    totalPrizesUsdAmount!: number;
}

export default PrizeStatsModel;
