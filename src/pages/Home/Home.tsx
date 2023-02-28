import React from 'react';
import { DenomsUtils, I18n, StringsUtils } from 'utils';
import numeral from 'numeral';

import { Button, Card, CountDown } from 'components';
import { NavigationConstants } from 'constant';
import cosmonautOnTheMoon from 'assets/images/cosmonaut_on_the_moon.png';
import cosmonautWithBalloons from 'assets/images/cosmonaut_with_balloons.png';
import coins_staked from 'assets/images/coins_staked_2.svg';
import star from 'assets/images/yellow_star.svg';
import arrow from 'assets/images/arrow.svg';

import './Home.scss';

const Home = () => {
    const renderBigWinnerCard = (denom: string, prize: number, address: string) => {
        return (
            <Button
                onClick={() => {
                    window.open(`${NavigationConstants.LUM_EXPLORER}/account/${address}`, '_blank')?.focus();
                }}
                outline
                className='big-winner-card'
            >
                <img width={20} height={20} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} />
                <span className='prize'>
                    {numeral(prize).format('0,0[.]0a')} {denom}
                </span>
                <div className='address'>{StringsUtils.trunc(address)}</div>
                <img src={arrow} alt='arrow' />
            </Button>
        );
    };

    return (
        <div className='home-container mt-5 mt-xxl-0'>
            <div className='row g-4'>
                <div className='col-xxl-7 col-12'>
                    <Card className='best-prize-card' withoutPadding>
                        <h3 className='pt-xl-5 pb-xl-4 ps-xl-5 py-4 ps-4'>{I18n.t('home.nextBestPrize')}</h3>
                        <div className='content'>
                            <img src={cosmonautOnTheMoon} alt='Cosmonaut on the moon' className='cosmonaut-on-the-moon' />
                            <div className='best-prize-container'>
                                <div className='d-flex'>
                                    <span className='currency'>$</span>
                                    <span>{numeral(6757).format('0,0').replaceAll(',', '\u00a0')}</span>
                                </div>
                            </div>
                            <div className='mt-5 d-flex align-items-center justify-content-between w-100'>
                                <div className='network'>
                                    <img src={DenomsUtils.getIconFromDenom('atom')} alt='denom' height={32} width={32} />
                                    <span className='ms-3'>atom</span>
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
                        <div className='col-xxl-12 col-lg-6 col-xl-6 col-md-12 col-sm-12'>
                            <Card>
                                <h3>{I18n.t('home.totalValueLocked')}</h3>
                                <div className='d-flex align-items-center pt-3'>
                                    <img alt='coin staked' src={coins_staked} />
                                    <span className='ms-3 total-value-locked'>{numeral(67574567).format('$0,0[.]0a')}</span>
                                </div>
                            </Card>
                        </div>
                        <div className='col-xxl-12 col-lg-6 col-xl-6 col-md-12 col-sm-12'>
                            <Card>
                                <img src={cosmonautWithBalloons} alt='Cosmonaut with balloons' className='cosmonaut-with-balloons' />
                                <h3>{I18n.t('home.lastBigWinners')}</h3>
                                <div className='big-winners-container pt-4'>
                                    {renderBigWinnerCard('evmos', 14564, 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f')}
                                    {renderBigWinnerCard('lum', 23456543, 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f')}
                                    {renderBigWinnerCard('atom', 143, 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f')}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
            <div className='d-flex justify-content-center'>
                <Button className='save-btn' to={NavigationConstants.POOLS}>
                    <img src={star} alt='Star' />
                    {I18n.t('home.cta')}
                    <img src={star} alt='Star' />
                </Button>
            </div>
        </div>
    );
};

export default Home;
