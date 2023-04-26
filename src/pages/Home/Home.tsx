import React from 'react';
import { useSelector } from 'react-redux';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import numeral from 'numeral';

import { BestPrizeCard, BigWinnerCard, Button, Card, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import { RootState } from 'redux/store';

import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import Assets from 'assets';

import './Home.scss';

const Home = () => {
    const bestPoolPrize = useSelector((state: RootState) => state.pools?.bestPoolPrize);
    const pools = useSelector((state: RootState) => state.pools.pools);
    const prices = useSelector((state: RootState) => state.stats.prices);

    const tvl = pools.reduce((acc, pool) => acc + NumbersUtils.convertUnitNumber(pool.tvlAmount) * (prices[DenomsUtils.getNormalDenom(pool.nativeDenom)] || 1), 0);

    return (
        <div className='home-container mt-3 mt-lg-5'>
            <div className='row g-4'>
                {bestPoolPrize && (
                    <div className='col-xxl-7 col-12'>
                        <BestPrizeCard biggestPrize={bestPoolPrize.prizeToWin} poolId={bestPoolPrize.poolId.toString()} countdownTo={bestPoolPrize.nextDrawAt} />
                    </div>
                )}
                <div className='col-xxl-5 col-12'>
                    <div className='row g-4'>
                        <div className='col-12 col-lg-6 col-xxl-12'>
                            <Card>
                                <h3>{I18n.t('home.totalValueLocked')}</h3>
                                <div className='d-flex align-items-center pt-3'>
                                    <img alt='coin staked' src={Assets.images.coinsStaked2} />
                                    <span className='ms-3 total-value-locked'>{numeral(tvl).format('$0,0[.]00a')}</span>
                                </div>
                            </Card>
                        </div>
                        <div className='col-12 col-lg-6 col-xxl-12'>
                            <Card>
                                <Lottie
                                    className='cosmonaut-with-balloons'
                                    animationData={cosmonautWithBalloons}
                                    segments={[
                                        [0, 30],
                                        [30, 128],
                                    ]}
                                />
                                <h3>{I18n.t('home.lastBigWinners')}</h3>
                                <div className='big-winners-container pt-4'>
                                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={14564} denom='evmos' className='flex-grow-1' />
                                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={23456543} denom='lum' className='flex-grow-1' />
                                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={143} denom='atom' className='flex-grow-1' />
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <div className='start-50 translate-middle-x save-and-win-btn-container'>
                <Button className='save-btn glow-bg' to={NavigationConstants.POOLS}>
                    <img src={Assets.images.yellowStar} alt='Star' />
                    {I18n.t('home.cta')}
                    <img src={Assets.images.yellowStar} alt='Star' />
                </Button>
            </div>
        </div>
    );
};

export default Home;
