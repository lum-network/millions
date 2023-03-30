import React from 'react';
import { DenomsUtils, I18n } from 'utils';
import { AnimatedNumber, Card, CountDown, Lottie } from 'components';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import { LumTypes } from '@lum-network/sdk-javascript';

import './BestPrizeCard.scss';

interface IProps {
    biggestPrize: LumTypes.Coin | null;
    countdownTo?: string;
}

const BestPrizeCard = ({ biggestPrize, countdownTo }: IProps) => {
    return (
        <Card className='best-prize-card' withoutPadding>
            <h3 className='pt-xl-5 pb-xl-4 ps-xl-5 py-4 ps-4'>{I18n.t('home.nextBestPrize')}</h3>
            <div className='content'>
                <Lottie
                    className='cosmonaut-on-the-moon'
                    animationData={cosmonautOnTheMoon}
                    segments={[
                        [0, 41],
                        [41, 257],
                    ]}
                />
                <div className='best-prize-container'>
                    <div className='d-flex'>
                        <span className='currency'>$</span>
                        {/*<span>*/}
                        {/*    {numeral(biggestPrize?.amount || '0')*/}
                        {/*        .format('0,0')*/}
                        {/*        .replaceAll(',', '\u00a0')}*/}
                        {/*</span>*/}
                        <AnimatedNumber number={Number(biggestPrize?.amount) ?? 0} />
                    </div>
                </div>
                {countdownTo && (
                    <div className='mt-5 d-flex align-items-center justify-content-between w-100'>
                        <div className='network'>
                            <img src={biggestPrize ? DenomsUtils.getIconFromDenom(biggestPrize.denom) : '-'} alt='denom' height={32} width={32} />
                            <span className='ms-2'>{biggestPrize ? DenomsUtils.getNormalDenom(biggestPrize.denom) : '-'}</span>
                        </div>
                        <div>
                            <CountDown homePage to={countdownTo} />
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default BestPrizeCard;
