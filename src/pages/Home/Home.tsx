import React from 'react';
import { I18n } from 'utils';

import { Card } from 'components';

import './Home.scss';
import numeral from 'numeral';

const Home = () => {
    return (
        <div className='home-container'>
            <div className='row g-4 g-xxl-5'>
                <div className='col-xxl-7 col-12'>
                    <Card className='best-prize-card' withoutPadding>
                        <h3 className='py-xxl-5 ps-xxl-5 py-4 ps-4'>{I18n.t('home.nextBestPrize')}</h3>
                        <div className='content'>
                            <div className='best-prize-container'>
                                <div className='d-flex'>
                                    <span className='currency'>$</span>
                                    <span>{numeral(6750).format('0,0')}</span>
                                </div>
                            </div>
                            <div className='mt-5 d-flex align-items-center justify-content-between'>
                                <div className='network'>
                                    <img src='' />
                                    <span>atom</span>
                                </div>
                                <div></div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='col-xxl-5 col-12'>
                    <Card>
                        <h3>{I18n.t('home.totalValueLocked')}</h3>
                    </Card>
                    <Card>
                        <h3>{I18n.t('home.lastBigWinners')}</h3>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Home;
