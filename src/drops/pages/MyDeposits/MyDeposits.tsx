import React from 'react';
import { I18n } from 'utils';
import { DepositDropsCard } from 'drops/components';
import { Card } from 'components';
import { NavigationConstants } from 'constant';

const MyDeposits = () => {
    return (
        <div className='drops-my-deposits mt-5'>
            <h2>{I18n.t('depositDrops.myDeposits.title')}</h2>
            <Card className='my-5'>Deposits</Card>
            <DepositDropsCard cta={I18n.t('depositDrops.card.ctaFromDeposits')} link={NavigationConstants.DROPS_POOLS} />
        </div>
    );
};

export default MyDeposits;
