import React, { useEffect } from 'react';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { AnimatedNumber, Card, CountDown, Lottie } from 'components';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { useWindowSize } from 'hooks';
import { BalanceModel } from 'models';

import './BestPrizeCard.scss';

interface IProps {
    biggestPrize: BalanceModel | null;
    countdownTo?: Date;
}

const calculateFontSize = (charactersCount: number, screenWidth: number): number => {
    const MAX_FONT_SIZE = 140;
    const MIN_FONT_SIZE = 50;
    const MAX_CHARACTERS = 10;
    const MIN_CHARACTERS = 4;

    const range = MAX_FONT_SIZE - MIN_FONT_SIZE;
    const charactersRatio = (charactersCount - MIN_CHARACTERS) / (MAX_CHARACTERS - MIN_CHARACTERS);
    const fontSize = screenWidth / (charactersCount + 1);
    const clampedFontSize = Math.min(Math.max(fontSize, MIN_FONT_SIZE), MAX_FONT_SIZE);

    if (charactersCount > MIN_CHARACTERS) {
        const scaledFontSize = clampedFontSize - range * charactersRatio;
        return Math.max(scaledFontSize, MIN_FONT_SIZE);
    }

    return clampedFontSize;
};

const BestPrizeCard = ({ biggestPrize, countdownTo }: IProps) => {
    const { width } = useWindowSize();
    const [fontSize, setFontSize] = React.useState(0);

    useEffect(() => {
        if (!biggestPrize) {
            return;
        }

        setFontSize(calculateFontSize(NumbersUtils.convertUnitNumber(biggestPrize?.amount).toFixed().length, width));
    }, [biggestPrize]);

    return (
        <Card className='best-prize-card' withoutPadding>
            <div className='content'>
                <div className='title-container'>
                    <h3 className=''>{I18n.t('home.nextBestPrize')}</h3>
                </div>
                <div className='best-prize-container'>
                    <div className='d-flex'>
                        <span style={{ fontSize: `${fontSize / 2}px` }} className='mt-2 mt-sm-3 mt-md-4 me-2 me-sm-3'>
                            $
                        </span>
                        <div style={{ fontSize: `${fontSize}px` }}>
                            <AnimatedNumber number={NumbersUtils.convertUnitNumber(biggestPrize?.amount || 0)} />
                        </div>
                    </div>
                </div>
                {countdownTo && (
                    <div className='d-flex flex-column flex-sm-row align-items-center justify-content-between w-100 best-prize-countdown'>
                        <div className='network mt-4 mt-sm-0'>
                            <img src={biggestPrize ? DenomsUtils.getIconFromDenom(biggestPrize.denom) : '-'} alt='denom' height={32} width={32} />
                            <span className='ms-2'>{biggestPrize ? DenomsUtils.getNormalDenom(biggestPrize.denom) : '-'}</span>
                        </div>
                        <div className='mt-4 mt-sm-0'>
                            <CountDown homePage to={countdownTo} />
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
