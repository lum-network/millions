import React from 'react';

import { Card } from 'components';
import { PoolsUtils } from 'utils';

import '../Pools.scss';

interface IProps {
    id: string;
    totalDeposit: number;
    maxEarning: number;
}

const PoolCard = ({ id, totalDeposit, maxEarning }: IProps) => {
    return (
        <Card className='pool-card-container'>
            <img width={88} height={88} src={PoolsUtils.getLogoFromId(id)} alt={id} />
            <div className="name-container">
                <span className="name">{id}</span>
            </div>
        </Card>
    );
};

export default PoolCard;
