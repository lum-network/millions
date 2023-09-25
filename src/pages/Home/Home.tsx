import React from 'react';
import numeral from 'numeral';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { BestPrizeCard, BigWinnerCard, Button, Card, Lottie } from 'components';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { RootState } from 'redux/store';
import { DenomsUtils, Firebase, I18n, NumbersUtils } from 'utils';

import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import Assets from 'assets';

import './Home.scss';

const Home = () => {
    const bestPoolPrize = useSelector((state: RootState) => state.pools.bestPoolPrize);
    const pools = useSelector((state: RootState) => state.pools.pools);
    const prices = useSelector((state: RootState) => state.stats.prices);
    const biggestAprPrizes = useSelector((state: RootState) => state.prizes.biggestAprPrizes);

    const navigate = useNavigate();
    const tvl = pools.reduce((acc, pool) => acc + NumbersUtils.convertUnitNumber(pool.tvlAmount) * (prices[DenomsUtils.getNormalDenom(pool.nativeDenom)] || 1), 0);

    return (
        <div className='home-container mt-3 mt-lg-5'>
            <div className='row g-4'>
                <div className='col-xxl-7 col-12'>
                    <BestPrizeCard
                        delay={150}
                        className='min-height-550'
                        biggestPrize={bestPoolPrize?.estimatedPrizeToWin || null}
                        poolId={bestPoolPrize?.poolId.toString()}
                        countdownTo={bestPoolPrize?.nextDrawAt}
                    />
                </div>
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
                            <Card
                                onClick={() => {
                                    navigate(NavigationConstants.WINNERS);
                                    Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LUCKIEST_WINNERS_CARD_CLICK);
                                }}
                            >
                                <h3>{I18n.t('home.lastBigWinners')}</h3>
                                <div className='d-flex align-items-center justify-content-center text-center'>
                                    <Lottie
                                        className={biggestAprPrizes && biggestAprPrizes.length > 0 ? 'cosmonaut-with-balloons' : 'cosmonaut-with-balloons no-prizes'}
                                        animationData={cosmonautWithBalloons}
                                        segments={[
                                            [0, 30],
                                            [30, 128],
                                        ]}
                                    />
                                </div>
                                <div className='big-winners-container pt-4'>
                                    {biggestAprPrizes && biggestAprPrizes.length > 0 ? (
                                        biggestAprPrizes
                                            .slice(0, 3)
                                            .map((prize, index) => (
                                                <BigWinnerCard
                                                    key={index}
                                                    price={prices[DenomsUtils.getNormalDenom(prize.denom)] || 0}
                                                    address={prize.address}
                                                    apr={prize.apr}
                                                    prize={prize.amount}
                                                    denom={prize.denom}
                                                    className='flex-grow-1'
                                                />
                                            ))
                                    ) : (
                                        <div className='d-flex flex-column align-items-center justify-content-center text-center'>
                                            <h3 className=''>{I18n.t('mySavings.noPrizes.title')}</h3>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <div className='start-50 translate-middle-x save-and-win-btn-container'>
                <Button className='save-btn' to={NavigationConstants.POOLS}>
                    <img src={Assets.images.yellowStar} alt='Star' />
                    {I18n.t('home.cta')}
                    <img src={Assets.images.yellowStar} alt='Star' />
                </Button>
            </div>
        </div>
    );
};

export default Home;
