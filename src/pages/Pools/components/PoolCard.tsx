import React from 'react';
import numeral from 'numeral';

import { Button, Card, CountDown } from 'components';
import { DenomsUtils, I18n } from 'utils';

import '../Pools.scss';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

interface IProps {
    denom: string;
    tvl: number;
    prize?: number;
    drawEndAt?: string;
}

const PoolCard = ({ denom, tvl, prize, drawEndAt }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);

    const price = prices?.[denom];

    return (
        <Card className='pool-card-container'>
            <img width={88} height={88} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} />
            <div className='name-container'>
                <span className='name'>{denom}</span>
            </div>
            <div className='prize-container'>
                <span className='prize-value mb-1'>${price && prize ? numeral(prize * price).format('0,0') : ' --'}</span>
                <span className='prize'>
                    {numeral(prize).format('0,0')} {denom}
                </span>
            </div>
            <div className='information-container'>
                <div className='tvl-container'>
                    <div className='tvl-label'>{I18n.t('pools.tvl')}</div>
                    <div className='tvl'>
                        {numeral(tvl).format('0,0')} {denom}
                    </div>
                </div>
                <div className='separator' />
                <div className='countdown-container'>
                    <div className='countdown-label'>{I18n.t('pools.drawEndAt')}</div>
                    <div className='countdown'>
                        <CountDown to={drawEndAt || new Date(Date.now() + 1000).toString()} />
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <Button to={`${NavigationConstants.POOLS}/${denom}`} className='w-100'>
                    {I18n.t('pools.cta')}
                </Button>
            </div>
        </Card>
    );
};

export default PoolCard;
