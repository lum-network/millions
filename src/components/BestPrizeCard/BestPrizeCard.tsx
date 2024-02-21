import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Assets from 'assets';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { AnimatedNumber, Button, Card, CountDown, Lottie } from 'components';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { PoolModel } from 'models';
import { DenomsUtils, Firebase, FontsUtils, I18n } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

import './BestPrizeCard.scss';

interface IProps {
    delay?: number;
    title?: string;
}

const BestPrizeCard = ({ delay, title }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats.prices);
    const pools = useSelector((state: RootState) => state.pools.pools);

    const sortedPoolsByDate = useMemo(() => {
        return pools.sort((a, b) => (a.nextDrawAt?.getTime() ?? 1) - (b.nextDrawAt?.getTime() ?? 2));
    }, [pools]);

    const { width } = useWindowSize();
    const [fontSize, setFontSize] = React.useState(0);
    const [drawInProgress, setDrawInProgress] = useState(false);
    const [currentPool, setCurrentPool] = useState<PoolModel | null>(null);
    const [playCarousel, setPlayCarousel] = useState(true);

    const navigate = useNavigate();

    const price = prices[DenomsUtils.getNormalDenom(currentPool?.nativeDenom ?? '')] || null;

    useEffect(() => {
        if (!currentPool) {
            return;
        }

        setFontSize(FontsUtils.calculateFontSize(((currentPool?.estimatedPrizeToWin?.amount ?? 0) * (price ?? 1)).toFixed().length, width));
    }, [currentPool?.estimatedPrizeToWin, width]);

    // Effect to set the current pool to the first pool when the pools are fetched
    useEffect(() => {
        // Set the highest prize pool as the current pool
        if (sortedPoolsByDate.length > 0) {
            const tmpPools = sortedPoolsByDate.slice(0);
            setCurrentPool(
                tmpPools.sort(
                    (a, b) =>
                        (b.estimatedPrizeToWin?.amount ?? 0) * prices[DenomsUtils.getNormalDenom(b.nativeDenom)] -
                        (a.estimatedPrizeToWin?.amount ?? 0) * prices[DenomsUtils.getNormalDenom(a.nativeDenom)],
                )[0],
            );
        }
    }, [sortedPoolsByDate]);

    // Effect to play the carousel
    useEffect(() => {
        if (!playCarousel) {
            const timeout = setTimeout(() => {
                setPlayCarousel(true);
            }, 30000);

            return () => clearTimeout(timeout);
        }

        if (playCarousel) {
            const interval = setInterval(() => {
                if (currentPool) {
                    const index = sortedPoolsByDate.findIndex((pool) => pool.poolId === currentPool.poolId);
                    setCurrentPool(sortedPoolsByDate[(index + 1) % sortedPoolsByDate.length]);
                }
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [currentPool, playCarousel, sortedPoolsByDate]);

    const renderIllu = () => {
        switch (DenomsUtils.getNormalDenom(currentPool?.nativeDenom ?? '')) {
            case 'atom':
                return (
                    <Lottie
                        className='cosmonaut-on-the-moon'
                        animationData={cosmonautOnTheMoon}
                        segments={[
                            [0, 41],
                            [41, 257],
                        ]}
                    />
                );
            case 'huahua':
                return <img alt='huahua' src={Assets.chains.huahuaIllustration} className='huahua no-filter' />;
            default:
                return null;
        }
    };

    return (
        <div>
            <Card withoutPadding className='p-3 p-xxl-4 mb-4 d-flex justify-content-center align-items-center'>
                {sortedPoolsByDate.map((pool, index) => (
                    <div
                        onClick={() => {
                            setPlayCarousel(false);
                            setCurrentPool(pool);
                        }}
                        key={index}
                        className={`me-4 d-flex flex-column align-items-center select-pool-button ${pool.poolId === currentPool?.poolId && 'active'}`}
                    >
                        <img src={pool ? DenomsUtils.getIconFromDenom(pool.nativeDenom) : '-'} alt='denom' height={64} width={64} className='no-filter mb-1' />
                        {pool.nextDrawAt ? <CountDown to={pool.nextDrawAt} simple /> : null}
                    </div>
                ))}
            </Card>
            <Card
                className={`best-prize-card position-relative`}
                withoutPadding
                onClick={
                    currentPool?.poolId
                        ? () => {
                              navigate(`${NavigationConstants.POOL_DETAILS}/${DenomsUtils.getNormalDenom(currentPool.nativeDenom)}/${currentPool.poolId}`);
                              Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.BEST_PRIZE_CARD_CLICK, {
                                  pool_id: currentPool.poolId,
                                  denom: DenomsUtils.getNormalDenom(currentPool.nativeDenom),
                                  amount: currentPool?.estimatedPrizeToWin?.amount,
                                  remaining_time: currentPool.nextDrawAt ? (currentPool.nextDrawAt.getTime() - new Date().getTime()) / 1000 : null,
                              });
                          }
                        : undefined
                }
            >
                <img alt='star' src={Assets.images.orbit} className='orbit no-filter' />
                <img alt='star' src={Assets.images.starVisu} className='star star-1 no-filter' />
                <img alt='star' src={Assets.images.starVisu} className='star star-2 no-filter' />
                <img alt='star' src={Assets.images.starVisu} className='star star-3 no-filter' />
                <img alt='star' src={Assets.images.starVisu} className='star star-4 no-filter' />
                <div className='content'>
                    <div className='title-container'>
                        <h3 className=''>{title || I18n.t('home.nextBestPrize')}</h3>
                    </div>
                    <div className='best-prize-container'>
                        <div className='d-flex'>
                            {currentPool?.estimatedPrizeToWin?.amount && price ? (
                                <>
                                    <span style={{ fontSize: `${fontSize / 2}px` }} className='mt-2 mt-sm-3 mt-md-4 me-2 me-sm-3'>
                                        $
                                    </span>
                                    <div style={{ fontSize: `${fontSize}px` }}>
                                        <AnimatedNumber delay={delay} number={Math.round(currentPool.estimatedPrizeToWin.amount * price)} />
                                    </div>
                                </>
                            ) : (
                                <img alt='Prize pool placeholeder' src={Assets.images.biggestPrizePoolPlaceholder} className='mt-2 mt-sm-3 mt-md-4 no-filter' />
                            )}
                        </div>
                    </div>
                    {currentPool?.nextDrawAt && (
                        <div className='d-flex flex-column flex-sm-row align-items-center justify-content-between w-100 best-prize-countdown'>
                            <div className='network mt-4 mt-sm-0'>
                                <img src={currentPool ? DenomsUtils.getIconFromDenom(currentPool.nativeDenom) : '-'} alt='denom' height={32} width={32} className='no-filter' />
                                <span className='ms-2'>{currentPool ? DenomsUtils.getNormalDenom(currentPool.nativeDenom) : '-'}</span>
                            </div>
                            <div className='mt-4 mt-sm-0'>
                                {drawInProgress ? (
                                    <div className='draw-in-progress-container text-nowrap'>
                                        <img src={Assets.images.deposit} alt='deposit' height={16} width={16} />
                                        <span className='ms-2'>{I18n.t('common.drawInProgress')}</span>
                                    </div>
                                ) : (
                                    <CountDown homePage to={currentPool.nextDrawAt} onCountdownEnd={() => setDrawInProgress(true)} />
                                )}
                            </div>
                        </div>
                    )}
                    {renderIllu()}
                </div>
            </Card>
            {currentPool?.poolId ? (
                <div className='d-flex justify-content-center mt-4'>
                    <Button className='save-btn' forcePurple to={`${NavigationConstants.POOL_DETAILS}/${DenomsUtils.getNormalDenom(currentPool.nativeDenom)}/${currentPool.poolId}`}>
                        <img src={Assets.images.yellowStar} alt='Star' className='no-filter' />
                        {I18n.t('home.cta')} {DenomsUtils.getNormalDenom(currentPool.nativeDenom).toUpperCase()}
                        <img src={Assets.images.yellowStar} alt='Star' className='no-filter' />
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default BestPrizeCard;
