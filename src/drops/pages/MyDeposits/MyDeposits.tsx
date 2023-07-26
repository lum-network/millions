import React, { useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';

import { Button, Card, Modal, SmallerDecimal } from 'components';
import { NavigationConstants } from 'constant';
import { DepositDropsCard } from 'drops/components';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { RootState } from 'redux/store';
import { AggregatedDepositModel, DepositModel } from 'models';

import DropsDetailsModal from './components/Modals/DropsDetailsModal/DropsDetailsModal';
import EditDepositModal from './components/Modals/EditDepositModal/EditDepositModal';
import CancelDropModal from './components/Modals/CancelDropModal/CancelDropModal';

import './MyDeposits.scss';

const MyDeposits = () => {
    const [selectedDeposit, setSelectedDeposit] = useState<DepositModel | null>(null);
    const [selectedDepositDrop, setSelectedDepositDrop] = useState<AggregatedDepositModel | null>(null);
    const dropsDetailsModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const depositDrops = useSelector((state: RootState) => state.wallet?.lumWallet?.depositDrops);
    const prices = useSelector((state: RootState) => state.stats?.prices);

    useEffect(() => {
        const handler = () => {
            setSelectedDeposit(null);
        };

        const cancelDropModal = document.getElementById('cancelDropModal');
        const editDepositModal = document.getElementById('editDepositModal');

        if (cancelDropModal) {
            cancelDropModal.addEventListener('hidden.bs.modal', handler);
        }

        if (editDepositModal) {
            editDepositModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (cancelDropModal) {
                cancelDropModal.removeEventListener('hidden.bs.modal', handler);
            }

            if (editDepositModal) {
                editDepositModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    const onAction = (deposit: DepositModel) => {
        setSelectedDeposit(deposit);
    };

    const renderDepositDrop = (drop: AggregatedDepositModel, index: number) => {
        const usdPrice = NumbersUtils.convertUnitNumber(drop.amount?.amount || '0') * prices[DenomsUtils.getNormalDenom(drop.amount?.denom || '')] || 0;

        return (
            <div key={index} className='drops-card p-3 p-xl-4'>
                <div className='row align-items-center'>
                    <div className='col-12 col-md-6 col-xl-3 order-1'>
                        <div className='d-flex'>
                            <img width={40} height={40} alt='deposit drop' src={Assets.images.depositDrop} />
                            <div className='ms-3 d-flex flex-column'>
                                <span className='deposit-drop-title'>{I18n.t('depositDrops.myDeposits.depositDrops', { count: drop.deposits.length })}</span>
                                <span className='deposit-drop-date'>{dayjs(drop.createdAt).format('ll')}</span>
                            </div>
                        </div>
                    </div>
                    <div className='d-flex flex-column col-12 col-md-4 col-xl-3 mt-3 mt-xl-0 text-start order-2 order-md-3 order-xl-2'>
                        <div className='d-flex flex-column'>
                            <div>
                                <span className='deposit-drop-amount'>
                                    <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0)).format('0,0.000000')} />
                                </span>
                                &nbsp;
                                <span className='deposit-drop-amount-denom'>{DenomsUtils.getNormalDenom(drop.amount?.denom || '')}</span>
                            </div>
                            <span className='deposit-drop-usd-amount'>{numeral(usdPrice).format('$0,0.00')}</span>
                        </div>
                    </div>
                    <div className='col-12 col-md-6 col-xl-2 mt-3 mt-md-0 text-start text-md-end text-xl-start order-3 order-md-2 order-xl-3'>
                        {drop.deposits.length} {I18n.t('depositDrops.myDeposits.wallet', { count: drop.deposits.length })}
                    </div>
                    <div className='col-12 col-md-4 col-xl-2 mt-3 mt-xl-0 order-4'>
                        <div className='ms-md-auto deposit-drop-state rounded-pill text-nowrap success'>
                            {I18n.t('depositDrops.myDeposits.activeSince', { count: dayjs().diff(dayjs(drop.createdAt), 'day') })}
                        </div>
                    </div>
                    <div className='col-12 col-md-4 col-xl-2 order-5'>
                        <Button
                            onClick={() => {
                                if (drop.deposits.length > 0) {
                                    setSelectedDepositDrop(drop);
                                    dropsDetailsModalRef.current?.show();
                                }
                            }}
                            outline
                            className='ms-auto mt-3 mt-xl-0 w-100 w-md-auto'
                        >
                            {I18n.t('depositDrops.myDeposits.seeAll')}
                        </Button>
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
            <DropsDetailsModal
                drops={selectedDepositDrop}
                poolDenom={DenomsUtils.getNormalDenom(selectedDepositDrop?.amount?.denom || '')}
                prices={prices}
                modalRef={dropsDetailsModalRef}
                onEdit={onAction}
                onCancel={onAction}
            />
            <EditDepositModal deposit={selectedDeposit} />
            <CancelDropModal deposits={selectedDeposit ? [selectedDeposit] : (selectedDepositDrop?.deposits as DepositModel[] | undefined)} />
        </div>
    );
};

export default MyDeposits;
