import { Exclude, Expose, Transform, Type } from 'class-transformer';

@Exclude()
class TokenModel {
    @Expose()
    price!: number;

    @Expose({ name: 'symbol' })
    @Type(() => String)
    @Transform(({ value }) => value.toString().toLowerCase())
    denom!: string;
}

export default TokenModel;
