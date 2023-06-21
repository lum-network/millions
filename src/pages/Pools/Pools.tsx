import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import PoolCard from './components/PoolCard';
import PoolCardPlaceholder from './components/PoolCardPlaceholder';

import './Pools.scss';

const placeholderNames = ['Mad Scientist ?', 'Lucky Star ?'];

const Pools = () => {
    const pools = useSelector((state: RootState) => state.pools.pools);

    const poolsPlaceholders = [];

    if (pools.length < 3) {
        poolsPlaceholders.push(...new Array(3 - pools.length).fill({}));
    }

    return (
        <div className='pools-container mt-3 mt-lg-5'>
            <h1 className='mb-0'>{I18n.t('pools.title')}</h1>
            <div className='row g-xxl-5 g-4 py-2 py-lg-4'>
                {pools.map((pool, index) => (
                    <div className='col-12 col-md-6 col-xl-4' key={`pool-${index}`}>
                        <PoolCard
                            drawEndAt={pool.nextDrawAt || new Date()}
                            denom={DenomsUtils.getNormalDenom(pool.nativeDenom)}
                            poolId={pool.poolId.toString()}
                            tvl={NumbersUtils.convertUnitNumber(pool.tvlAmount)}
                            estimatedPrize={pool.estimatedPrizeToWin?.amount}
                            apy={pool.apy}
                        />
                    </div>
                ))}
                {poolsPlaceholders.map((_, index) => (
                    <div className='col-12 col-md-6 col-xl-4' key={`pool-placeholder-${index}`}>
                        <PoolCardPlaceholder name={placeholderNames[index] || 'New Pool'} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pools;
