import { Expose, Type } from 'class-transformer';

class MarketData {
    @Expose()
    price!: number;

    @Expose()
    denom!: string;
}

class MarketDataModel {
    @Expose({ name: 'market_data' })
    @Type(() => MarketData)
    marketData?: MarketData[];

    @Expose()
    id!: string;
}

export default MarketDataModel;
