import React, { useEffect } from 'react';
import { I18n } from 'utils';
import { DepositDropsCard } from 'drops/components';
import { Card } from 'components';
import { NavigationConstants } from 'constant';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';

const MyDeposits = () => {
    const dispatch = useDispatch<Dispatch>();
    const lumWallet = useSelector((state: RootState) => state.wallet.lumWallet);
    const depositDrops = useSelector((state: RootState) => state.wallet?.lumWallet?.depositDrops);

    useEffect(() => {
        if (!lumWallet) {
            return;
        }

        dispatch.wallet.getDepositsAndWithdrawalsDrops(lumWallet.address);
    }, []);

    return (
        <div className='drops-my-deposits mt-5'>
            <h2>{I18n.t('depositDrops.myDeposits.title')}</h2>
            <Card className='my-5'>Deposits</Card>
            <DepositDropsCard cta={I18n.t('depositDrops.card.ctaFromDeposits')} link={NavigationConstants.DROPS_POOLS} />
        </div>
    );
};

export default MyDeposits;
