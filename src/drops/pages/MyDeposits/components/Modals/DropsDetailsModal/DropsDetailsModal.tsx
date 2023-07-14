import React, { useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';
import { Modal, SmallerDecimal, Table } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';
import { AggregatedDepositModel } from 'models';

import './DropsDetailsModal.scss';

const DrawDetails = ({
    drops,
    poolDenom,
    prices,
    modalRef,
}: {
    drops: AggregatedDepositModel | null;
    poolDenom: string;
    prices: { [key: string]: number };
    modalRef: React.RefObject<ModalHandlers>;
}) => {
    const [dropsPage, setDropsPage] = useState(1);

    return (
        <Modal id='dropsDetailsModal' ref={modalRef} modalWidth={700}>
            {drops ? (
                <div className='d-flex flex-column align-items-center'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(poolDenom)} alt={poolDenom} className='pool-icon' />
                        <h1 className='mb-0 ms-3 ms-md-4 text-nowrap'>{I18n.t('depositDrops.card.title')}</h1>
                    </div>
                    <div className='my-3'>
                        <div className='d-flex flex-row justify-content-evenly'>
                            <div className='d-flex flex-row align-items-baseline'>
                                <h4>{I18n.t('common.pool')}</h4>
                                <div className='d-flex align-items-center justify-content-center ms-2 index-container'>#{drops.poolId?.toString()}</div>
                            </div>
                            <div className='d-flex flex-row align-items-baseline ms-4'>
                                <h4>{I18n.t('common.deposit')}</h4>
                                <div className='d-flex align-items-center justify-content-center ms-2 index-container'>#{drops.depositId?.toString()}</div>
                            </div>
                        </div>
                        <div className='mt-2 date'>{dayjs(drops.createdAt).format('ll')}</div>
                    </div>
                    <div className='w-100 draw-winners-table-container'>
                        <Table
                            className='draw-winners-table'
                            onPageChange={(page) => setDropsPage(page)}
                            pagination={
                                drops.deposits.length > 5
                                    ? {
                                          pagesTotal: Math.ceil(drops.deposits.length / 5),
                                          hasNextPage: dropsPage < Math.ceil(drops.deposits.length / 5),
                                          hasPreviousPage: dropsPage > 1,
                                          page: dropsPage,
                                      }
                                    : undefined
                            }
                        >
                            {drops.deposits.slice((dropsPage - 1) * 5, dropsPage * 5).map((drop, index) => (
                                <tr key={`${drops.poolId?.toString()}-${drops.depositId?.toString()}-drop-${index}`}>
                                    <td>
                                        <div className='d-flex flex-row align-items-center winner-address' title={drop.winnerAddress}>
                                            <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                                <img src={Assets.images.depositDrop} alt='drops' />
                                            </div>
                                            {StringsUtils.trunc(drop.winnerAddress || '')}
                                        </div>
                                    </td>
                                    <td className='text-md-end'>
                                        <div className='d-flex flex-column justify-content-center tx-amount'>
                                            <div className='amount text-nowrap'>{numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0) * (prices[poolDenom] || 0)).format('$0,0[.]00')}</div>
                                            <small className='usd-price'>
                                                <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0)).format('0,0.00')} /> {poolDenom.toUpperCase()}
                                            </small>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default DrawDetails;
