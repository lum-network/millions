import { Exclude, Expose } from 'class-transformer';

@Exclude()
class BalanceModel {
    @Expose()
    amount!: number;

    @Expose()
    denom!: string;
}

export default BalanceModel;
