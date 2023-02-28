import React from 'react';
import { I18n } from 'utils';

import PoolCard from './components/PoolCard';

import './Pools.scss';

const Pools = () => {
    return (
        <div className='pools-container'>
            <h1>{I18n.t('pools.title')}</h1>
            <div className='row g-xxl-5 g-4'>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-28'} denom={'atom'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'osmo'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'lum'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'cre'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'evmos'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'cro'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'atom'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'atom'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'atom'} tvl={230456} prize={5000} />
                </div>
                <div className='col-12 col-sm-6 col-lg-4 col-xxl-3'>
                    <PoolCard drawEndAt={'2023-02-25'} denom={'atom'} tvl={230456} prize={5000} />
                </div>
            </div>
        </div>
    );
};

export default Pools;
