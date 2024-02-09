import React from 'react';
import { NavigationConstants } from 'constant';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import Assets from 'assets';
import { DepositDropsCard } from 'drops/components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import PoolCard from 'pages/Pools/components/PoolCard';
import PoolCardPlaceholder from 'pages/Pools/components/PoolCardPlaceholder';

const placeholderNames = ['Mad Scientist ?', 'Lucky Star ?'];

interface IProps {}

const Pools = ({}: IProps): JSX.Element => {
    const pools = useSelector((state: RootState) => state.pools.pools);

    const poolsPlaceholders = [];

    if (pools.length < 3) {
        poolsPlaceholders.push(...new Array(3 - pools.length).fill({}));
    }

    return (
        <div className='pools-container mt-3'>
            <div className='d-flex align-items-center'>
                <img src={Assets.images.depositDrop} alt='Gift' className='no-filter' />
                <h1 className='ms-3 mb-0'>{I18n.t('depositDrops.pools.title')}</h1>
            </div>
            <DepositDropsCard cta={I18n.t('depositDrops.card.ctaFromPools')} link={NavigationConstants.DROPS_MY_DEPOSITS} className='my-4' />
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
                            ctaText={I18n.t('depositDrops.pools.ctaText')}
                            ctaLink={`${NavigationConstants.DROPS_POOLS}/${DenomsUtils.getNormalDenom(pool.nativeDenom)}/${pool.poolId.toString()}`}
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
