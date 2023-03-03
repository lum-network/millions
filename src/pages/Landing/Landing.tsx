import React from 'react';

import { I18n } from 'utils';
import { Button, Card } from 'components';
import { NavigationConstants } from 'constant';
import cosmonautWithBalloons2 from 'assets/images/cosmonaut_with_balloons_2.png';
import cosmonautWithBalloons from 'assets/images/cosmonaut_with_balloons.png';
import cosmonautOnTheMoon from 'assets/images/cosmonaut_on_the_moon.png';
import cosmonautWithCoin from 'assets/images/cosmonaut_with_coin.png';
import cosmonautWithDuck from 'assets/images/cosmonaut_with_duck.png';
import cosmonautZen from 'assets/images/cosmonaut_zen.png';
import cosmonautInPool from 'assets/images/cosmonaut_in_pool.png';
import cosmonautWithRocket from 'assets/images/cosmonaut_with_rocket.png';
import cosmonautDab from 'assets/images/cosmonaut_dab.png';
import coinsStaked2 from 'assets/images/coins_staked_2.svg';
import landingArrow from 'assets/images/landing_arrow.svg';
import landingDoubleArrows from 'assets/images/landing_double_arrows.svg';
import numeral from 'numeral';

import './Landing.scss';
import PoolCard from './components/PoolCard';

const Landing = () => {
    const onClickNewPool = () => {
        window.open(`${NavigationConstants.DISCORD}`, '_blank')?.focus();
    };

    return (
        <div className='landing-container'>
            <div className='row g-5'>
                <div className='saving-left col-12 col-xl-6 col-xxl-5'>
                    <h1 className='mb-4'>{I18n.t('landing.saving.title')}</h1>
                    <p>{I18n.t('landing.saving.p1')}</p>
                    <p>{I18n.t('landing.saving.p2')}</p>
                    <Button className='cta' to={NavigationConstants.HOME}>
                        {I18n.t('landing.saving.cta')}
                    </Button>
                </div>
                <div className='d-none d-xxl-block col-xxl-1' />
                <div className='col-12 col-xl-6 col-xxl-6'>
                    <Card className='best-prize-card' withoutPadding>
                        <h3 className='pt-xl-5 pb-xl-4 ps-xl-5 py-4 ps-4'>{I18n.t('landing.saving.biggestPrizeToWin')}</h3>
                        <div className='content'>
                            <img src={cosmonautOnTheMoon} alt='Cosmonaut on the moon' className='cosmonaut-on-the-moon' />
                            <div className='best-prize-container'>
                                <div className='d-flex'>
                                    <span className='currency'>$</span>
                                    <span>{numeral(6757).format('0,0').replaceAll(',', '\u00a0')}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='position-relative cosmos-game-left col-12 col-xl-6 col-xxl-5'>
                    <img className='cosmos-with-balloons' src={cosmonautWithBalloons2} alt='Cosmonaut with balloon' />
                </div>
                <div className='d-none d-xxl-block col-xxl-1' />
                <div className='cosmos-game-right col-12 col-xl-6 col-xxl-6'>
                    <h1 className='mb-4'>{I18n.t('landing.cosmosGame.title')}</h1>
                    <p>{I18n.t('landing.cosmosGame.p1')}</p>
                    <p>{I18n.t('landing.cosmosGame.p2')}</p>
                    <p>{I18n.t('landing.cosmosGame.p3')}</p>
                </div>
            </div>
            <div id='howItWorks' className='winners col-12 d-flex flex-column align-items-center'>
                <h1 className='text-center mb-4'>{I18n.t('landing.winners.title')}</h1>
                <Card withoutPadding className='w-100 d-flex flex-xl-row flex-column align-items-center p-3 py-5 p-xl-5'>
                    <div className='d-flex flex-column align-items-center'>
                        <div className='square'>
                            <img src={cosmonautWithCoin} alt='Cosmonaut with coin' className='cosmonaut-coin' />
                        </div>
                        <div className='number'>1</div>
                        <span className='legend'>{I18n.t('landing.winners.p1')}</span>
                    </div>
                    <div className='mx-5'>
                        <img src={landingArrow} alt='arrow' className='arrow' />
                    </div>
                    <div className='d-flex flex-column align-items-center'>
                        <div className='square'>
                            <img src={cosmonautWithBalloons} alt='Cosmonaut with balloons' className='cosmonaut-balloons' />
                        </div>
                        <div className='number'>2</div>
                        <span className='legend'>{I18n.t('landing.winners.p2')}</span>
                    </div>
                    <div className='d-flex d-xl-none'>
                        <img src={landingArrow} alt='arrow' className='arrow' />
                    </div>
                    <div className='mx-4'>
                        <img src={landingDoubleArrows} alt='Double arrows' className='arrow-double' />
                    </div>
                    <div className='image-group'>
                        <div className='d-flex flex-column flex-xl-row align-items-center'>
                            <div className='square'>
                                <img src={cosmonautWithDuck} alt='Cosmonaut with duck' className='cosmonaut-duck' />
                            </div>
                            <div className='legend mt-3 mt-xl-0'>{I18n.t('landing.winners.p3')}</div>
                        </div>
                        <div className='or'>{I18n.t('landing.winners.or')}</div>
                        <div className='d-flex flex-column flex-xl-row align-items-center'>
                            <div className='square'>
                                <img src={cosmonautZen} alt='Cosmonaut zen' className='cosmonaut-zen' />
                            </div>
                            <div className='legend mt-3 mt-xl-0'>{I18n.t('landing.winners.p4')}</div>
                        </div>
                    </div>
                </Card>
            </div>
            <div className='col-12 pools'>
                <div className='d-flex justify-content-between align-items-center mb-4'>
                    <div className='d-flex align-items-lg-center flex-column flex-lg-row'>
                        <h1>{I18n.t('landing.pools.title')}</h1>
                        <div className='ms-lg-5 d-flex align-items-center'>
                            <img width={42} height={42} src={coinsStaked2} alt='Coins staked' className='coins-staked me-2' />
                            <div className='d-flex flex-column'>
                                <span className='tvl-legend'>{I18n.t('landing.pools.tvl')}</span>
                                <span className='tvl-value'>{numeral(300004567).format('0,0').replaceAll(',', '\u00a0')}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-none d-xl-flex'>
                        <Button outline onClick={onClickNewPool}>
                            {I18n.t('landing.pools.newPool')}
                        </Button>
                    </div>
                </div>
                <div className='pools-cards-container cards-list'>
                    <PoolCard denom={'atom'} tvl={30000} prize={58} />
                    <PoolCard denom={'osmo'} tvl={30000} prize={58} />
                    <PoolCard denom={'lum'} tvl={56898865} prize={5000000} />
                </div>
                <div className='d-flex flex-column align-items-center mt-4'>
                    <Button className='d-block d-xl-none mb-3 cta' outline onClick={onClickNewPool}>
                        {I18n.t('landing.pools.newPool')}
                    </Button>
                    <Button className='cta' to={NavigationConstants.POOLS}>
                        {I18n.t('landing.pools.cta')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Landing;
