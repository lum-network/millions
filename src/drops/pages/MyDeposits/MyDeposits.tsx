import React from 'react';
import { I18n } from 'utils';
import { DepositDropsCard } from 'drops/components';
import { Card } from 'components';
import { NavigationConstants } from 'constant';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { AggregatedDepositModel } from 'models';
import Assets from 'assets';
import dayjs from 'dayjs';

import './MyDeposits.scss';

const MyDeposits = () => {
    const depositDrops = useSelector((state: RootState) => state.wallet?.lumWallet?.depositDrops);

    console.log('depositDrops', depositDrops);

    const renderDepositDrop = (drop: AggregatedDepositModel, index: number) => {
        return (
            <div className='drops-card p-4'>
                <div className='d-flex'>
                    <img width={40} height={40} alt='deposit drop' src={Assets.images.depositDrop} />
                    <div className='ms-3 d-flex flex-column'>
                        <span className='deposit-drop-title'>{I18n.t('depositDrops.myDeposits.depositDrops', { count: drop.deposits.length })}</span>
                        <span className='deposit-drop-date'>{dayjs(drop.createdAt).format('ll')}</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='drops-my-deposits mt-5'>
            <h2 className='mb-5'>{I18n.t('depositDrops.myDeposits.title')}</h2>
            {depositDrops && depositDrops.length ? <Card className='mb-5'>{depositDrops.map((drop, index) => renderDepositDrop(drop, index))}</Card> : null}
            <DepositDropsCard cta={I18n.t('depositDrops.card.ctaFromDeposits')} link={NavigationConstants.DROPS_POOLS} />
        </div>
    );
};

export default MyDeposits;
