import React, { useRef, useState } from 'react';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { DepositDropsCard } from 'drops/components';
import { Button, Card, Modal, SmallerDecimal } from 'components';
import { NavigationConstants } from 'constant';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { AggregatedDepositModel } from 'models';
import Assets from 'assets';
import dayjs from 'dayjs';
import numeral from 'numeral';
import DropsDetailsModal from './components/Modals/DropsDetailsModal/DropsDetailsModal';

import './MyDeposits.scss';

const MyDeposits = () => {
    const depositDrops = useSelector((state: RootState) => state.wallet?.lumWallet?.depositDrops);
    const prices = useSelector((state: RootState) => state.stats?.prices);

    const dropsDetailsModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const [selectedDepositDrop, setSelectedDepositDrop] = useState<AggregatedDepositModel | null>(null);

    const renderDepositDrop = (drop: AggregatedDepositModel, index: number) => {
        const usdPrice = NumbersUtils.convertUnitNumber(drop.amount?.amount || '0') * prices[DenomsUtils.getNormalDenom(drop.amount?.denom || '')] || 0;

        return (
            <div key={index} className='drops-card p-2 p-md-3 p-xl-4 row align-items-center'>
                <div className='d-flex col-12 col-xl-3'>
                    <img width={40} height={40} alt='deposit drop' src={Assets.images.depositDrop} />
                    <div className='ms-3 d-flex flex-column'>
                        <span className='deposit-drop-title'>{I18n.t('depositDrops.myDeposits.depositDrops', { count: drop.deposits.length })}</span>
                        <span className='deposit-drop-date'>{dayjs(drop.createdAt).format('ll')}</span>
                    </div>
                </div>
                <div className='d-flex flex-column col-12 col-xl-3'>
                    <div>
                        <span className='deposit-drop-amount'>
                            <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0)).format('0,0.000000')} />
                        </span>
                        &nbsp;
                        <span className='deposit-drop-amount-denom'>{DenomsUtils.getNormalDenom(drop.amount?.denom || '')}</span>
                    </div>
                    <span className='deposit-drop-usd-amount'>{numeral(usdPrice).format('$0,0.00')}</span>
                </div>
                <div className='col-12 col-xl-2'>
                    <span>{`${drop.deposits.length} ${I18n.t('depositDrops.myDeposits.wallet', { count: drop.deposits.length })}`}</span>
                </div>
                <div className='col-12 col-xl-2'>
                    <div className='deposit-drop-state rounded-pill text-nowrap success'>{I18n.t('depositDrops.myDeposits.activeSince', { count: dayjs().diff(dayjs(drop.createdAt), 'day') })}</div>
                </div>
                <div className='d-flex col-12 col-xl-2 justify-content-end'>
                    <Button
                        onClick={() => {
                            if (drop.deposits.length > 0) {
                                setSelectedDepositDrop(drop);
                                dropsDetailsModalRef.current?.show();
                            }
                        }}
                        outline
                    >
                        {I18n.t('depositDrops.myDeposits.seeAll')}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className='drops-my-deposits mt-5'>
            <h2 className='mb-5'>{I18n.t('depositDrops.myDeposits.title')}</h2>
            {depositDrops && depositDrops.length ? <Card className='mb-5'>{depositDrops.map((drop, index) => renderDepositDrop(drop, index))}</Card> : null}
            <DepositDropsCard cta={I18n.t('depositDrops.card.ctaFromDeposits')} link={NavigationConstants.DROPS_POOLS} />
            <DropsDetailsModal drops={selectedDepositDrop} poolDenom={DenomsUtils.getNormalDenom(selectedDepositDrop?.amount?.denom || '')} prices={prices} modalRef={dropsDetailsModalRef} />
        </div>
    );
};

export default MyDeposits;
