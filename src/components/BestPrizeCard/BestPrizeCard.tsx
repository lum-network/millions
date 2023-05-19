import React, { useEffect } from 'react';
import { DenomsUtils } from 'utils';
import { Card, CountDown, Lottie } from 'components';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { LumTypes } from '@lum-network/sdk-javascript';
import { useWindowSize } from 'hooks';

import './BestPrizeCard.scss';

interface IProps {
    biggestPrize: LumTypes.Coin | null;
    countdownTo?: Date;
}

const calculateFontSize = (charactersCount: number, screenWidth: number): number => {
    const MAX_FONT_SIZE = 160;
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

        setFontSize(calculateFontSize('$ATOM POOL'.length, width));
    }, [biggestPrize]);

    return (
        <Card className='best-prize-card' withoutPadding>
            <div className='content'>
                <div className='title-container'>
                    <h3 className='d-flex flex-row'>
                        LAUNCH MAY 29TH
                        {/*<CountDown to={new Date(Date.UTC(2023, 4, 3, 12))} />*/}
                    </h3>
                </div>
                <div className='best-prize-container'>
                    <div className='d-flex'>
                        <span className='size-content-card'>$</span>
                        <div className='size-content-card'>ATOM&nbsp;POOL</div>
                    </div>
                </div>
                {countdownTo && (
                    <div className='d-flex align-items-center justify-content-between w-100 best-prize-countdown'>
                        <div className='network'>
                            <img src={biggestPrize ? DenomsUtils.getIconFromDenom(biggestPrize.denom) : '-'} alt='denom' height={32} width={32} />
                            <span className='ms-2'>{biggestPrize ? DenomsUtils.getNormalDenom(biggestPrize.denom) : '-'}</span>
                        </div>
                        <div>
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
