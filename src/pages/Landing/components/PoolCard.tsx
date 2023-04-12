import React from 'react';
import { Card } from 'components';
import { DenomsUtils, I18n } from 'utils';
import numeral from 'numeral';

interface IProps {
    denom: string;
    tvl: number;
    prize: number;
}

const PoolCard = ({ denom, prize }: IProps) => {
    return (
        <Card withoutPadding className='p-3 p-xxl-4 pool-card d-flex flex-column align-items-center'>
            <div className='d-flex flex-column justify-content-center align-items-center'>
                {denom === 'soon' ? <div className='soon-container' /> : <img width={88} height={88} src={DenomsUtils.getIconFromDenom(denom)} alt={denom} />}
                <div className='name-container mt-3'>
                    <span className='name'>{denom === 'soon' ? 'Coming soon' : denom.toUpperCase()}</span>
                </div>
            </div>
            <div className='tvl-container d-flex flex-column align-items-center'>
                <span className='tvl-legend mb-3'>{I18n.t('landing.pools.deposited')}</span>
                <span className='tvl mb-1'>Coming soon</span>
            </div>
            <Card withoutPadding flat className='prize-card'>
                <span>{I18n.t('landing.pools.prizeToWin')}</span>
                <span style={{ filter: 'blur(5px)', color: '#8C8C8C' }}>{numeral(prize).format('$0,0')}</span>
            </Card>
        </Card>
    );
};

export default PoolCard;
