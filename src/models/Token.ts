import { Exclude, Expose } from 'class-transformer';

@Exclude()
class TokenModel {
    @Expose()
    price!: number;

    @Expose({ name: 'display' })
    denom!: string;
}

export default TokenModel;
