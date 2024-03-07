import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Skeleton from 'react-loading-skeleton';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, Card, CountDown } from 'components';
import { Breakpoints, FirebaseConstants, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { RootState } from 'redux/store';
import { DenomsUtils, Firebase, I18n, WalletProvidersUtils } from 'utils';

interface IProps {
    denom: string;
    tvl: number;
    poolId: string;
    estimatedPrize?: number;
    drawEndAt: Date;
    apy: number;
    ctaText?: string;
    ctaLink?: string;
}

const PoolCard = ({ denom, tvl, poolId, estimatedPrize, drawEndAt, apy, ctaText, ctaLink }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);
    const loadingAdditionalInfo = useSelector((state: RootState) => state.loading.effects.pools.getPoolsAdditionalInfo);
    const lumWallet = useSelector((state: RootState) => state.wallet.lumWallet);

    const [drawInProgress, setDrawInProgress] = useState(false);

    const winSizes = useWindowSize();
    const price = prices?.[denom];

    return (
        <Card className='pool-card-container glow-bg'>
            <div className='prize-container'>
                <img width={68} height={68} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} className='no-filter' />
                <div className='d-flex flex-column align-items-start ms-3'>
                    <div className='prize text-start text-lg-nowrap'>
                        {winSizes.width > Breakpoints.SM ? denom.toUpperCase() + ' ' : ''}
                        {I18n.t('poolDetails.prizePool')}
                    </div>
                    {loadingAdditionalInfo ? (
                        <Skeleton height={26} width={winSizes.width < Breakpoints.SM ? 140 : 190} />
                    ) : (
                        <div className='prize-value'>${price && estimatedPrize ? numeral(estimatedPrize * price).format('0,0') : ' --'}</div>
                    )}
                    {loadingAdditionalInfo ? (
                        <Skeleton height={12} width={winSizes.width < Breakpoints.SM ? 120 : 170} />
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
                    onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.VIEW_DETAILS_CLICK, { denom, pool_id: poolId })}
                    to={`${NavigationConstants.POOL_DETAILS}/${denom}/${poolId}`}
                    outline
                >
                    {I18n.t('pools.viewDetails')}
                </Button>
                <Button
                    {...(WalletProvidersUtils.isAnyWalletInstalled() && lumWallet === null
                        ? {
                              'data-bs-target': '#choose-wallet-modal',
                              'data-bs-toggle': 'modal',
                          }
                        : !WalletProvidersUtils.isAnyWalletInstalled()
                        ? {
                              'data-bs-target': '#get-keplr-modal',
                              'data-bs-toggle': 'modal',
                          }
                        : {
                              to: ctaLink ? ctaLink : `${NavigationConstants.POOLS}/${denom}/${poolId}`,
                          })}
                    forcePurple
                    className='deposit-cta w-100 mt-3'
                    onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSIT_CLICK, { denom, pool_id: poolId })}
                >
                    {ctaText ? ctaText : I18n.t('pools.cta')}
                </Button>
            </div>
        </Card>
    );
};

export default PoolCard;
