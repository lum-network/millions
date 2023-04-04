import Long from 'long';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import PoolCard from './components/PoolCard';

import './Pools.scss';

const Pools = () => {
    const pools = useSelector((state: RootState) => state.pools.pools);

    return (
        <div className='pools-container'>
            <h1>{I18n.t('pools.title')}</h1>
            <div className='row g-xxl-5 g-4'>
                {pools.map((pool, index) => (
                    <div className='col-12 col-sm-6 col-lg-4 col-xxl-3' key={`pool-${index}`}>
                        <PoolCard
                            drawEndAt={pool.nextDrawAt || new Date()}
                            denom={DenomsUtils.getNormalDenom(pool.nativeDenom)}
                            poolId={pool.poolId.toString()}
                            tvl={NumbersUtils.convertUnitNumber(pool.tvlAmount)}
                            prize={pool.prizeStrategy?.prizeBatches.reduce((acc, batch) => acc.add(batch.quantity), new Long(0)).toNumber()}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pools;
