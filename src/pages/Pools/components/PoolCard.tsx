import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import { Button, Card, CountDown } from 'components';
import { NavigationConstants } from 'constant';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import Assets from 'assets';

interface IProps {
    denom: string;
    tvl: number;
    poolId: string;
    prize?: number;
    drawEndAt: Date;
}

const PoolCard = ({ denom, tvl, poolId, prize, drawEndAt }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);
    const navigate = useNavigate();

    const price = prices?.[denom];

    return (
        <Card
            className='pool-card-container glow-bg'
            onClick={() => {
                navigate(`${NavigationConstants.POOL_DETAILS}/${denom}/${poolId}`);
            }}
        >
            <div className='prize-container'>
                <img width={64} height={64} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} />
                <div className='d-flex flex-column ms-3'>
                    <div className='prize'>{denom.toUpperCase()} Prize Pool</div>
                    <div className='prize-value mt-1'>${price && prize ? numeral(NumbersUtils.convertUnitNumber(prize) * price).format('0,0') : ' --'}</div>
                </div>
            </div>
            <div className='information-container'>
                <div className='apy-container pb-2'>
                    <div className='apy-label'>
                        <img src={Assets.images.dollarIcon} alt='dollar icon' className='me-2' width={24} height={24} /> {I18n.t('pools.apy')}
                    </div>
                    <div className='apy'>20%</div>
                </div>
                <div className='separator' />
                <div className='tvl-container py-2'>
                    <div className='tvl-label'>
                        <img src={Assets.images.coinsStackedPurple} alt='coins stacked purple' className='me-2' width={22} height={22} /> {I18n.t('pools.tvl')}
                    </div>
                    <div className='tvl'>
                        {numeral(tvl).format('0,0')} {denom}
                    </div>
                </div>
                <div className='separator' />
                <div className='countdown-container pt-2'>
                    <div className='countdown-label'>
                        <img src={Assets.images.clock} alt='clock' className='me-2' width={22} height={22} /> {I18n.t('pools.drawEndAt')}
                    </div>
                    <div className='countdown'>
                        <CountDown to={drawEndAt} />
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <Button to={`${NavigationConstants.POOLS}/${denom}/${poolId}`} className='deposit-cta w-100'>
                    {I18n.t('pools.cta')}
                </Button>
            </div>
        </Card>
    );
};

export default PoolCard;
