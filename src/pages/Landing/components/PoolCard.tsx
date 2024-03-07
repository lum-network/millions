import React from 'react';
import { Card } from 'components';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import numeral from 'numeral';

interface IProps {
    denom: string;
    tvl: number;
    prize: number;
}

const PoolCard = ({ denom, tvl, prize }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats?.prices);
    const price = prices?.[denom];

    return (
        <Card withoutPadding className='p-3 p-xxl-4 pool-card d-flex flex-column align-items-center'>
            <div className='d-flex flex-column justify-content-center align-items-center'>
                <img width={88} height={88} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} className='no-filter' />
                <div className='name-container mt-3'>
                    <span className='name'>{denom}</span>
                </div>
            </div>
            <div className='tvl-container d-flex flex-column align-items-center'>
                <span className='tvl-legend mb-3'>{I18n.t('landing.pools.deposited')}</span>
                <span className='tvl mb-1 text-center'>
                    {numeral(NumbersUtils.convertUnitNumber(tvl)).format('0,0')} {denom}
                </span>
                <span className='tvl-value'>≃${price ? numeral(NumbersUtils.convertUnitNumber(tvl) * price).format('0,0') : ' --'}</span>
            </div>
            <Card withoutPadding flat className='prize-card'>
                <span>{I18n.t('landing.pools.prizeToWin')}</span>
                <span>{numeral(prize * price).format('$0,0')}</span>
            </Card>
        </Card>
    );
};

export default PoolCard;
