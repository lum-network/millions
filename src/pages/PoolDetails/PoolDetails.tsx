import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import Assets from 'assets';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';

import { BigWinnerCard, Button, Card, CountDown, Lottie, SmallerDecimal, Table } from 'components';
import { NavigationConstants } from 'constant';
import { Error404 } from 'pages';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './PoolDetails.scss';

function float2rat(x: number) {
    const baseRatio = 100;
    const x1 = x * baseRatio;

    if (x === 0) {
        return '1 in ';
    }

    if (x1 >= baseRatio) {
        return '1 in 1';
    }

    return '1 in ' + numeral(100 / (x * 100)).format('0[.]00');
}

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

    const [estimationAmount, setEstimationAmount] = useState('');
    const [estimatedChances, setEstimatedChances] = useState(0);
    const [drawsHistoryPage, setDrawsHistoryPage] = useState(1);

    useEffect(() => {
        if (pool) {
            const amount = Number(estimationAmount) / (prices[denom || ''] || 1);
            const tvl = NumbersUtils.convertUnitNumber(pool.tvlAmount);
            const prizeStrat = pool.prizeStrategy;
            let avgPrizesDrawn = 0;

            if (prizeStrat) {
                for (const prizeBatch of prizeStrat.prizeBatches) {
                    avgPrizesDrawn += (Number(prizeBatch.drawProbability) / 1_000_000_000_000_000_000) * prizeBatch.quantity.toNumber();
                }

                const estimated = (avgPrizesDrawn * amount) / (amount + tvl);
                setEstimatedChances(estimated);
            }
        }
    }, [estimationAmount]);

    if (!pool || !denom) {
        return <Error404 />;
    }

    const userDeposits = lumWallet?.deposits.find((deposit) => (poolId ? deposit.poolId?.equals(poolId) : deposit.amount?.denom === 'u' + denom));
    const prizes = pool.prizeStrategy?.prizeBatches.map((prizeBatch) => ({
        count: prizeBatch.quantity.toNumber(),
        chances: prizeBatch.poolPercent.toNumber() / 100,
        value: (NumbersUtils.convertUnitNumber(pool.availablePrizePool?.amount || '0') * (prizeBatch.poolPercent.toNumber() / 100)) / prizeBatch.quantity.toNumber(),
    }));

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
                <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between position-relative prize-draw-card'>
                    <div className='biggest-prize-container d-flex flex-column mb-4 mb-lg-0'>
                        <h2>{I18n.t('poolDetails.biggestPrize')}</h2>
                        <div className='display-6'>{numeral(NumbersUtils.convertUnitNumber(pool.prizeToWin?.amount || 1) * (prices[denom] || 1)).format('$0,0[.]00')}</div>
                        {NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(pool.prizeToWin?.amount || 1))} {denom.toUpperCase()}
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
                    {pool.internalInfos?.illustration && <img alt='' src={pool.internalInfos.illustration} className='d-none d-sm-block pool-illustration' />}
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
                <div className='row row-cols-2'>
                    {prizes && (
                        <div className='col position-relative'>
                            <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>{I18n.t('poolDetails.prizeDistribution.title')}</h2>
                            <Card flat withoutPadding className='prize-distribution-card'>
                                <Table headers={I18n.t('poolDetails.prizeDistribution.tableHeaders', { returnObjects: true })} className='prize-distribution-table'>
                                    {prizes.map((prize, index) => (
                                        <tr key={index} className='stat-bg-white'>
                                            <td>
                                                <div className='d-flex flex-row'>
                                                    <div className='d-flex align-items-center justify-content-center me-3 index-container'>#{index + 1}</div>
                                                    {numeral(prize.value).format('$0,0')}
                                                </div>
                                            </td>
                                            <td>{prize.count}</td>
                                            <td className='text-end'>1 in {numeral(100 / (prize.chances * 100)).format('0[.]00')}</td>
                                        </tr>
                                    ))}
                                </Table>
                            </Card>
                            <Lottie className='cosmonaut-with-duck' animationData={cosmonautWithDuck} />
                        </div>
                    )}
                    <div className='col'>
                        <div className='h-100'>
                            <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>{I18n.t('poolDetails.winningChances.title')}</h2>
                            <Card flat withoutPadding className='winning-chances-card d-flex flex-column justify-content-between h-auto'>
                                <div>
                                    <small>{I18n.t('poolDetails.winningChances.estimatedSavings')}</small>
                                    <div className='d-flex flex-column mt-2'>
                                        <div className='estimation-input-container d-flex flex-row justify-content-between align-items-center py-2 px-4'>
                                            $<input type='number' className='w-100 me-3' min='0' value={estimationAmount} onChange={(e) => setEstimationAmount(e.target.value)} />
                                            {estimationAmount && (
                                                <div className='crypto-amount text-nowrap'>
                                                    {numeral(Number(estimationAmount) / (prices[denom] || 1)).format('0,0[.]00')} {denom.toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className='d-flex flex-row justify-content-between align-items-center mt-3'>
                                            {[10, 100, 1000, 10000].map((amount) => {
                                                return (
                                                    <button
                                                        type='button'
                                                        key={`estimation-for-${amount}`}
                                                        className='d-flex align-items-center justify-content-center py-1 w-100 estimation-amount-btn'
                                                        onClick={() => setEstimationAmount(amount.toFixed())}
                                                    >
                                                        {numeral(amount).format('$0,0')}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-5'>
                                    <small>{I18n.t('poolDetails.winningChances.chanceToWin')}</small>
                                    <div className='chance-to-win mt-2 stat-bg-white'>{float2rat(estimatedChances)}</div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className='row position-relative'>
                    <div className='col-12 col-xl-4'>
                        <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>{I18n.t('poolDetails.users.title')}</h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row align-items-lg-center p-4'>
                            <div className='w-100 me-3'>
                                <small>{I18n.t('poolDetails.users.deposit')}</small>
                                <div className='stat-bg-white h4 mb-0 mt-2'>
                                    {pool ? NumbersUtils.convertUnitNumber(pool.tvlAmount) / pool.depositorsCount.toNumber() : 0} {denom.toUpperCase()}
                                </div>
                            </div>
                            <div className='w-100 mt-4 mt-lg-0'>
                                <small>{I18n.t('poolDetails.users.currentDraw')}</small>
                                <div className='stat-bg-white h4 mb-0 mt-2'>{pool?.depositorsCount.toString() || 0}</div>
                            </div>
                        </Card>
                    </div>
                    <div className='col-12 col-xl-7'>
                        <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>
                            <img src={Assets.images.trophy} alt='Trophy' className='me-3 mb-1' width='28' />
                            {I18n.t('poolDetails.winners.title')}
                        </h2>
                        <Card flat withoutPadding className='d-flex flex-column flex-lg-row justify-content-between align-items-lg-center p-4'>
                            <div className='w-100'>
                                <small>{I18n.t('poolDetails.winners.totalPrizes')}</small>
                                <div className='stat-bg-white h4 mb-0 mt-2'>{numeral(540000).format('$0,0')}</div>
                            </div>
                            <div className='w-100 my-4 my-lg-0 mx-0 mx-lg-3'>
                                <small>{I18n.t('poolDetails.winners.totalPoolPrizes')}</small>
                                <div className='stat-bg-white h4 mb-0 mt-2'>254</div>
                            </div>
                            <div className='w-100'>
                                <small>{I18n.t('poolDetails.winners.bestPrizeWon')}</small>
                                <div className='stat-bg-white h4 mb-0 mt-2'>
                                    {numeral(84000).format('0,0').toUpperCase()} {denom.toUpperCase()}
                                </div>
                            </div>
                        </Card>
                    </div>
                    <Lottie className='cosmonaut-with-balloons' animationData={cosmonautWithBalloons} />
                </div>
                <h2 className='mb-0 mt-5'>{I18n.t('luckiestWinners.title')}</h2>
                <div className='d-flex flex-column flex-lg-row justify-content-between align-items-stretch align-items-lg-center mt-3'>
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={14564} denom={denom} className='flex-grow-1' />
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={23456543} denom={denom} className='mx-0 mx-lg-4 flex-grow-1' />
                    <BigWinnerCard address='lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f' prize={143} denom={denom} className='flex-grow-1' />
                </div>
                {pool.draws && pool.draws.length > 0 && (
                    <div className='row'>
                        <div className='col-12'>
                            <h2 className='mb-0 mt-5 mb-2 mb-lg-4'>{I18n.t('poolDetails.drawsHistory.title')}</h2>
                            <Card flat withoutPadding className='draws-history-card d-flex flex-column flex-lg-row justify-content-between align-items-lg-center'>
                                <Table
                                    className='draws-history-table w-100'
                                    headers={I18n.t('poolDetails.drawsHistory.tableHeaders', { returnObjects: true })}
                                    pagination={
                                        pool.draws.length > 5
                                            ? {
                                                  page: drawsHistoryPage,
                                                  pagesTotal: Math.ceil(pool.draws.length / 5),
                                                  hasNextPage: drawsHistoryPage < Math.ceil(pool.draws.length / 5),
                                                  hasPreviousPage: drawsHistoryPage > 1,
                                              }
                                            : undefined
                                    }
                                    onPageChange={(page) => setDrawsHistoryPage(page)}
                                >
                                    {pool.draws.slice((drawsHistoryPage - 1) * 5, (drawsHistoryPage - 1) * 5 + 5).map((draw, index) => {
                                        return (
                                            <tr key={`draw-${index}`}>
                                                <td>
                                                    <div className='d-flex align-items-center justify-content-center me-3 index-container'>#{draw.poolId.toString()}</div>
                                                </td>
                                                <td>
                                                    <div className='d-flex align-items-center justify-content-center me-3 index-container'>#{draw.drawId.toString()}</div>
                                                </td>
                                                <td className='draw-date'>{dayjs(draw.createdAt).format('DD MMM YYYY - hh:mmA')}</td>
                                                <td className='text-end'>{draw.totalWinCount.toString()}</td>
                                                <td className='text-end'>
                                                    <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(draw.totalWinAmount) * (prices[denom] || 1)).format('$0,0[.]00')} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </Table>
                            </Card>
                        </div>
                    </div>
                )}
                <Lottie className='cosmonaut-dab mx-auto' animationData={cosmonautDab} />
            </Card>
        </div>
    );
};

export default PoolDetails;
