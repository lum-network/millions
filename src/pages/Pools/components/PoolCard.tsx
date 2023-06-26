import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import { Button, Card, CountDown } from 'components';
import { NavigationConstants } from 'constant';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, KeplrUtils } from 'utils';
import Skeleton from 'react-loading-skeleton';
import Assets from 'assets';

interface IProps {
    denom: string;
    tvl: number;
    poolId: string;
    estimatedPrize?: number;
    drawEndAt: Date;
    apy: number;
}

const PoolCard = ({ denom, tvl, poolId, estimatedPrize, drawEndAt, apy }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);
    const loadingAdditionalInfo = useSelector((state: RootState) => state.loading.effects.pools.getPoolsAdditionalInfo);
    const lumWallet = useSelector((state: RootState) => state.wallet.lumWallet);

    const navigate = useNavigate();

    const [drawInProgress, setDrawInProgress] = useState(false);

    const price = prices?.[denom];

    return (
        <Card
            className='pool-card-container glow-bg'
            onClick={() => {
                navigate(`${NavigationConstants.POOL_DETAILS}/${denom}/${poolId}`);
            }}
        >
            <div className='prize-container'>
                <img width={68} height={68} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} />
                <div className='d-flex flex-column align-items-start ms-3'>
                    <div className='prize'>
                        {denom.toUpperCase()} {I18n.t('poolDetails.prizePool')}
                    </div>
                    {loadingAdditionalInfo ? (
                        <Skeleton height={26} width={190} />
                    ) : (
                        <div className='prize-value'>${price && estimatedPrize ? numeral(estimatedPrize * price).format('0,0') : ' --'}</div>
                    )}
                    {loadingAdditionalInfo ? (
                        <Skeleton height={12} width={170} />
                    ) : (
                        <div className='prize-amount'>
                            {estimatedPrize ? numeral(estimatedPrize).format('0,0') : ' --'} {denom}
                        </div>
                    )}
                </div>
            </div>
            <div className='information-container'>
                <div className='apy-container pb-2'>
                    <div className='apy-label'>
                        <img src={Assets.images.dollarIcon} alt='dollar icon' className='me-2' width={24} height={24} />
                        {I18n.t('pools.apy')}
                    </div>
                    {loadingAdditionalInfo ? <Skeleton height={18} width={70} /> : <div className='apy'>{apy ? numeral(apy).format('0.00') : '--'}%</div>}
                </div>
                <div className='separator' />
                <div className='tvl-container py-2'>
                    <div className='tvl-label'>
                        <img src={Assets.images.coinsStackedPurple} alt='coins stacked purple' className='me-2' width={22} height={22} /> {I18n.t('pools.tvl')}
                    </div>
                    {loadingAdditionalInfo ? <Skeleton height={18} width={70} /> : <div className='tvl'>${numeral(tvl * price).format('0,0')}</div>}
                </div>
                <div className='separator' />
                <div className='countdown-container pt-2'>
                    <div className='countdown-label'>
                        <img src={Assets.images.clock} alt='clock' className='me-2' width={22} height={22} /> {I18n.t('pools.drawEndAt')}
                    </div>
                    <div className={`countdown ${drawInProgress ? 'draw' : ''}`}>
                        {drawInProgress ? I18n.t('common.drawInProgress') : <CountDown to={drawEndAt} onCountdownEnd={() => setDrawInProgress(true)} />}
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <Button
                    {...(!KeplrUtils.isKeplrInstalled()
                        ? {
                              'data-bs-target': '#get-keplr-modal',
                              'data-bs-toggle': 'modal',
                          }
                        : lumWallet === null
                        ? {
                              'data-bs-target': '#choose-wallet-modal',
                              'data-bs-toggle': 'modal',
                          }
                        : {
                              to: `${NavigationConstants.POOLS}/${denom}/${poolId}`,
                          })}
                    className='deposit-cta w-100'
                >
                    {I18n.t('pools.cta')}
                </Button>
            </div>
        </Card>
    );
};

export default PoolCard;
