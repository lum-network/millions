import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, Card, CountDown } from 'components';
import { NavigationConstants } from 'constant';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

interface IProps {
    denom: string;
    tvl: number;
    poolId: string;
    prize?: number;
    drawEndAt: Date;
    placeholder?: boolean;
}

const PoolCard = ({ denom, tvl, poolId, prize, drawEndAt, placeholder }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);
    const navigate = useNavigate();

    const price = prices?.[denom];

    return (
        <Card
            className='pool-card-container'
            onClick={
                !placeholder
                    ? () => {
                          navigate(`${NavigationConstants.POOL_DETAILS}/${denom}/${poolId}`);
                      }
                    : undefined
            }
        >
            <img width={88} height={88} src={placeholder ? Assets.images.cosmonautCoin : DenomsUtils.getIconFromDenom(denom)} alt={denom} />
            <div className='name-container'>
                <span className='name'>{placeholder ? 'soon' : denom}</span>
            </div>
            <div className='prize-container'>
                <span className='prize-value mb-1' style={placeholder ? { filter: 'blur(5px)', color: '#8C8C8C' } : {}}>
                    ${price && prize ? numeral(NumbersUtils.convertUnitNumber(prize) * price).format('0,0') : ' --'}
                </span>
                <span className='prize'>Prize Pool</span>
            </div>
            <div className='information-container'>
                <div className='tvl-container'>
                    <div className='tvl-label'>{I18n.t('pools.tvl')}</div>
                    <div className='tvl' style={placeholder ? { filter: 'blur(5px)', color: '#8C8C8C' } : {}}>
                        {numeral(tvl).format('0,0')} {denom}
                    </div>
                </div>
                <div className='separator' />
                <div className='countdown-container'>
                    <div className='countdown-label'>{I18n.t('pools.drawEndAt')}</div>
                    <div className='countdown' style={placeholder ? { filter: 'blur(5px)', color: '#8C8C8C' } : {}}>
                        <CountDown to={drawEndAt} />
                    </div>
                </div>
            </div>
            <div className='w-100'>
                <Button disabled={placeholder} to={`${NavigationConstants.POOLS}/${denom}/${poolId}`} className='deposit-cta w-100'>
                    {I18n.t('pools.cta')}
                </Button>
            </div>
        </Card>
    );
};

export default PoolCard;
