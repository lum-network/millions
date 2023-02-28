import React from 'react';
import { DenomsUtils, I18n } from 'utils';
import numeral from 'numeral';

import { Card, CountDown } from 'components';
import cosmonautOnTheMoon from 'assets/images/cosmonaut_on_the_moon.png';
import coins_staked from 'assets/images/coins_staked_2.svg';

import './Home.scss';

const Home = () => {
    return (
        <div className='home-container mt-5 mt-xl-0'>
            <div className='row g-4'>
                <div className='col-xxl-7 col-12'>
                    <Card className='best-prize-card' withoutPadding>
                        <h3 className='py-xl-5 ps-xl-5 py-4 ps-4'>{I18n.t('home.nextBestPrize')}</h3>
                        <div className='content'>
                            <img src={cosmonautOnTheMoon} alt='Cosmonaut on the moon' className='cosmonaut-on-the-moon' />
                            <div className='best-prize-container'>
                                <div className='d-flex'>
                                    <span className='currency'>$</span>
                                    <span>{numeral(675).format('0,0[.]0a')}</span>
                                </div>
                            </div>
                            <div className='mt-5 d-flex align-items-center justify-content-between w-100'>
                                <div className='network'>
                                    <img src={DenomsUtils.getIconFromDenom('atom')} alt='denom' height={32} width={32} />
                                    <span className='ms-2'>atom</span>
                                </div>
                                <div>
                                    <CountDown homePage to={'2023-02-28'} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='col-xxl-5 col-12'>
                    <div className='row g-4'>
                        <div className='col-12'>
                            <Card>
                                <h3>{I18n.t('home.totalValueLocked')}</h3>
                                <div className='d-flex align-items-center pt-3'>
                                    <img alt='coin staked' src={coins_staked} />
                                    <span className='ms-3 total-value-locked'>{numeral(67574567).format('$0,0[.]0a')}</span>
                                </div>
                            </Card>
                        </div>
                        <div className='col-12'>
                            <Card>
                                <h3>{I18n.t('home.lastBigWinners')}</h3>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
