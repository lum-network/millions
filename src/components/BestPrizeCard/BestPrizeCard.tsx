import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Assets from 'assets';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { AnimatedNumber, Card, CountDown, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { BalanceModel } from 'models';
import { DenomsUtils, FontsUtils, I18n } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

import './BestPrizeCard.scss';

interface IProps {
    biggestPrize: BalanceModel | null;
    poolId?: string;
    countdownTo?: Date;
    className?: string;
    delay?: number;
    title?: string;
}

const BestPrizeCard = ({ biggestPrize, poolId, countdownTo, className, delay, title }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

    const { width } = useWindowSize();
    const [fontSize, setFontSize] = React.useState(0);
    const [drawInProgress, setDrawInProgress] = useState(false);

    const navigate = useNavigate();

    const price = prices[DenomsUtils.getNormalDenom(biggestPrize?.denom ?? '')] || null;

    useEffect(() => {
        if (!biggestPrize) {
            return;
        }

        setFontSize(FontsUtils.calculateFontSize((biggestPrize?.amount * (price ?? 1)).toFixed().length, width));
    }, [biggestPrize, width]);

    return (
        <Card
            className={`best-prize-card ${className}`}
            withoutPadding
            onClick={biggestPrize && poolId ? () => navigate(`${NavigationConstants.POOL_DETAILS}/${DenomsUtils.getNormalDenom(biggestPrize.denom)}/${poolId}`) : undefined}
        >
            <div className='content'>
                <div className='title-container'>
                    <h3 className=''>{title || I18n.t('home.nextBestPrize')}</h3>
                </div>
                <div className='best-prize-container'>
                    <div className='d-flex'>
                        {biggestPrize && biggestPrize.amount && price ? (
                            <>
                                <span style={{ fontSize: `${fontSize / 2}px` }} className='mt-2 mt-sm-3 mt-md-4 me-2 me-sm-3'>
                                    $
                                </span>
                                <div style={{ fontSize: `${fontSize}px` }}>
                                    <AnimatedNumber delay={delay} number={biggestPrize.amount * price} />
                                </div>
                            </>
                        ) : (
                            <img alt='Prize pool placeholeder' src={Assets.images.biggestPrizePoolPlaceholder} className='mt-2 mt-sm-3 mt-md-4' />
                        )}
                    </div>
                </div>
                {countdownTo && (
                    <div className='d-flex flex-column flex-sm-row align-items-center justify-content-between w-100 best-prize-countdown'>
                        <div className='network mt-4 mt-sm-0'>
                            <img src={biggestPrize ? DenomsUtils.getIconFromDenom(biggestPrize.denom) : '-'} alt='denom' height={32} width={32} />
                            <span className='ms-2'>{biggestPrize ? DenomsUtils.getNormalDenom(biggestPrize.denom) : '-'}</span>
                        </div>
                        <div className='mt-4 mt-sm-0'>
                            {drawInProgress ? (
                                <div className='draw-in-progress-container'>
                                    <img src={Assets.images.deposit} alt='deposit' height={16} width={16} />
                                    <span className='ms-2'>Draw in progress</span>
                                </div>
                            ) : (
                                <CountDown homePage to={countdownTo} onCountdownEnd={() => setDrawInProgress(true)} />
                            )}
                        </div>
                    </div>
                )}
                <Lottie
                    className='cosmonaut-on-the-moon'
                    animationData={cosmonautOnTheMoon}
                    segments={[
                        [0, 41],
                        [41, 257],
                    ]}
                />
            </div>
        </Card>
    );
};

export default BestPrizeCard;
