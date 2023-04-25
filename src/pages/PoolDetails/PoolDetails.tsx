import React from 'react';
import numeral from 'numeral';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Assets from 'assets';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import { BigWinnerCard, Button, Card, CountDown, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import { Error404 } from 'pages';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './PoolDetails.scss';

const PoolDetails = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();
    const navigate = useNavigate();

    const { lumWallet, prices, pools, pool } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
        pools: state.pools.pools,
        pool: poolId ? state.pools.pools.find((pool) => pool.poolId.toString() === poolId) : state.pools.pools.find((pool) => pool.nativeDenom === 'u' + denom),
    }));

    if (!pool || !denom) {
        return <Error404 />;
    }

    const userDeposits = lumWallet?.deposits.find((deposit) => (poolId ? deposit.poolId?.equals(poolId) : deposit.amount?.denom === 'u' + denom));

    return (
        <div className='pool-details-container mt-5'>
            <Card className='glow-bg'>
                <button
                    type='button'
                    onClick={() => navigate(NavigationConstants.POOLS)}
                    className='d-none close-btn bg-transparent rounded-circle d-xl-flex align-self-end justify-content-center align-items-center border-0 position-absolute top-0 end-0 mt-3 me-3'
                    aria-label='Close'
                >
                    <div className='btn-close' />
                </button>
                <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} className='pool-icon' />
                        <h1 className='mb-0 ms-4'>
                            {denom.toUpperCase()} Pool {pools.filter((pool) => pool.nativeDenom === 'u' + denom).length > 1 ? `#${pool.poolId.toString()}` : ''}
                        </h1>
                    </div>
                    <div className='d-flex flex-row my-4 my-lg-0'>
                        <img alt='coin staked' src={Assets.images.coinsStaked2} />
                        <div className='d-flex flex-column align-items-start justify-content-center ms-3'>
                            <h4 className='mb-0 text-nowrap'>{I18n.t('home.totalValueLocked')}</h4>
                            <div className='total-value-locked text-nowrap'>
                                {numeral(NumbersUtils.convertUnitNumber(pool.tvlAmount)).format('0,0[.]00')} {denom.toUpperCase()}
                            </div>
                        </div>
                    </div>
                    <Button to={`${NavigationConstants.POOLS}/${denom}/${poolId || pool.poolId.toString()}`} className='deposit-btn'>
                        {I18n.t('mySavings.deposit')}
                    </Button>
                </div>
                <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between position-relative prize-draw-card p-4'>
                    <div className='biggest-prize-container d-flex flex-column mb-4 mb-lg-0'>
                        <h2>{I18n.t('poolDetails.biggestPrize')}</h2>
                        <div className='display-6'>{numeral(11000 * (prices[denom] || 1)).format('$0,0[.]00')}</div>
                        11000 {denom.toUpperCase()}
                    </div>
                    <div className='next-draw-container'>
                        <h2>{I18n.t('poolDetails.nextDraw')}</h2>
                        <div className='display-6'>
                            <CountDown to={pool.nextDrawAt || new Date()} />
                        </div>
                    </div>
                    <div
                        style={{
                            background: 'transparent',
                            width: '232px',
                            height: '1px',
                        }}
                    />
                    {pool.internalInfos?.illustration && <img src={pool.internalInfos.illustration} className='d-none d-sm-block pool-illustration' />}
                </Card>
                {userDeposits && (
                    <>
                        <h2 className='mb-2 mb-lg-4 mt-5'>{I18n.t('poolDetails.myDeposits', { denom: denom.toUpperCase() })}</h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row align-items-lg-center justify-content-between p-4'>
                            <div className='d-flex flex-row align-items-center mb-4 mb-lg-0'>
                                <img src={DenomsUtils.getIconFromDenom(denom)} alt={denom} width='50' height='50' className='d-none d-sm-block me-4' />
                                <div>
                                    <h3 className='mb-0'>Deposit{userDeposits.deposits.length > 1 ? 's' : ` #${userDeposits.depositId?.toString()}`}</h3>
                                    {NumbersUtils.formatTo6digit(userDeposits.deposits.reduce((acc, deposit) => acc + NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0'), 0))}{' '}
                                    {denom.toUpperCase()}
                                </div>
                            </div>
                            <Button outline to={NavigationConstants.MY_SAVINGS}>
                                {I18n.t('poolDetails.viewDetails')}
                            </Button>
                        </Card>
                    </>
                )}
                <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>
                    <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                    {I18n.t('poolDetails.winners.title')}
                </h2>
                <div className='row'>
                    <div className='col-12 col-xl-8'>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between align-items-lg-center p-4'>
                            <div className='total-prizes-usd'>
                                <h4>{I18n.t('poolDetails.winners.totalPrizes')}</h4>
                                <div className='h2 mb-0'>$540 000</div>
                            </div>
                            <div className='total-prizes my-4 my-lg-0'>
                                <h4>{I18n.t('poolDetails.winners.totalPoolPrizes')}</h4>
                                <div className='h2 mb-0'>254</div>
                            </div>
                            <div className='best-prize'>
                                <h4>{I18n.t('poolDetails.winners.bestPrizeWon')}</h4>
                                <div className='h2 mb-0'>84K {denom.toUpperCase()}</div>
                            </div>
                        </Card>
                    </div>
                </div>
                <h2 className='mb-0 mt-5'>{I18n.t('luckiestWinners.title')}</h2>
                <div className='d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center mt-3 mb-4'>
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={14564} denom={denom} className='flex-grow-1' />
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={23456543} denom={denom} className='mx-0 mx-lg-4 flex-grow-1' />
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={143} denom={denom} className='flex-grow-1' />
                </div>
                <Lottie className='cosmonaut-dab mx-auto' animationData={cosmonautDab} />
            </Card>
        </div>
    );
};

export default PoolDetails;
