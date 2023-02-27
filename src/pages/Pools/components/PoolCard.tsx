import React from 'react';
import numeral from 'numeral';

import { Card, CountDown } from 'components';
import { I18n, PoolsUtils } from 'utils';

import '../Pools.scss';

interface IProps {
    id: string;
    totalDeposit: number;
    maxEarning: number;
    drawEndAt: string;
}

const PoolCard = ({ id, totalDeposit, maxEarning, drawEndAt }: IProps) => {
    return (
        <Card className='pool-card-container'>
            <img width={88} height={88} src={PoolsUtils.getLogoFromId(id)} alt={id} />
            <div className='name-container'>
                <span className='name'>{id}</span>
            </div>
            <div className='total-deposit-container'>
                <span className='total-deposit'>{numeral(totalDeposit).format('0,0')}</span>
                <span className='total-deposit-label'>{I18n.t('pools.totalDeposit')}</span>
            </div>
            <Card flat withoutPadding className='p-2'>
                <CountDown to={drawEndAt} />
            </Card>
        </Card>
    );
};

export default PoolCard;
