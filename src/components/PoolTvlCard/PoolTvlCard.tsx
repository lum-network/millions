import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Assets from 'assets';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { AnimatedNumber, Card, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { FontsUtils, I18n } from 'utils';

import './PoolTvlCard.scss';

interface IProps {
    tvl: number;
    className?: string;
    delay?: number;
    title?: string;
}

const PoolTvlCard = ({ tvl, className, delay, title }: IProps) => {
    const { width } = useWindowSize();
    const [fontSize, setFontSize] = React.useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        if (!tvl) {
            return;
        }

        setFontSize(FontsUtils.calculateFontSize(tvl.toFixed().length, width));
    }, [tvl, width]);

    return (
        <Card
            className={`atom-pool-tvl-card position-relative ${className}`}
            withoutPadding
            onClick={() => {
                navigate(`${NavigationConstants.HOME}`);
            }}
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
                        {tvl ? (
                            <>
                                <span style={{ fontSize: `${fontSize / 2}px` }} className='mt-2 mt-sm-3 mt-md-4 me-2 me-sm-3'>
                                    $
                                </span>
                                <div style={{ fontSize: `${fontSize}px` }}>
                                    <AnimatedNumber delay={delay} number={Math.round(tvl)} />
                                </div>
                            </>
                        ) : (
                            <img alt='Prize pool placeholeder' src={Assets.images.biggestPrizePoolPlaceholder} className='mt-2 mt-sm-3 mt-md-4 no-filter' />
                        )}
                    </div>
                </div>
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

export default PoolTvlCard;
