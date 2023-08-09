import { Exclude, Expose } from 'class-transformer';

@Exclude()
class LeaderboardItem {
    @Expose()
    amount!: number;

    @Expose()
    rank!: number;

    @Expose()
    address!: string;

    @Expose({ name: 'native_denom' })
    nativeDenom!: string;
}

export default LeaderboardItem;
