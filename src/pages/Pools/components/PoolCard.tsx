import React from 'react';

import '../Pools.scss';
import { Card } from 'components';

interface IProps {
    id: string;
    totalDeposit: number;
    maxEarning: number;
}

const PoolCard = ({ id, totalDeposit, maxEarning }: IProps) => {
    return <Card className='pool-card-container'>{totalDeposit}</Card>;
};

export default PoolCard;
