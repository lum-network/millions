import React from 'react';
import { DenomsUtils, I18n, StringsUtils } from 'utils';
import numeral from 'numeral';

import { Button, Card, CountDown, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import Assets from 'assets';

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
                <img src={Assets.images.arrow} alt='arrow' />
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
                                    <span>{numeral(6757).format('0,0').replaceAll(',', '\u00a0')}</span>
                                </div>
                            </div>
                            <div className='mt-5 d-flex align-items-center justify-content-between w-100'>
                                <div className='network'>
                                    <img src={DenomsUtils.getIconFromDenom('atom')} alt='denom' height={32} width={32} />
                                    <span className='ms-2'>atom</span>
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
                                    <img alt='coin staked' src={Assets.images.coinsStaked2} />
                                    <span className='ms-3 total-value-locked'>{numeral(67574567).format('$0,0[.]0a')}</span>
                                </div>
                            </Card>
                        </div>
                        <div className='col-xxl-12 col-lg-6 col-xl-6 col-md-12 col-sm-12'>
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
                    <img src={Assets.images.yellowStar} alt='Star' />
                    {I18n.t('home.cta')}
                    <img src={Assets.images.yellowStar} alt='Star' />
                </Button>
            </div>
        </div>
    );
};

export default Home;
