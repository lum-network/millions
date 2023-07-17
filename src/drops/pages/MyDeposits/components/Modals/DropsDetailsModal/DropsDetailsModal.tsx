import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';
import { Modal, SmallerDecimal, Table, Button } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';
import { AggregatedDepositModel, DepositModel } from 'models';

import './DropsDetailsModal.scss';

interface Props {
    drops: AggregatedDepositModel | null;
    poolDenom: string;
    prices: { [key: string]: number };
    modalRef: React.RefObject<ModalHandlers>;
    onEdit: (deposit: DepositModel) => void;
    onCancel?: (deposit: DepositModel) => void;
}

const DrawDetails = ({ drops, poolDenom, prices, modalRef, onCancel, onEdit }: Props) => {
    const [dropsPage, setDropsPage] = useState(1);

    useEffect(() => {
        const handler = () => {
            setDropsPage(1);
        };

        const dropsDetailsModal = document.getElementById('dropsDetailsModal');

        if (dropsDetailsModal) {
            dropsDetailsModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (dropsDetailsModal) {
                dropsDetailsModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    return (
        <Modal id='dropsDetailsModal' ref={modalRef} modalWidth={800}>
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
                    <div className='w-100 draw-winners-table-container position-relative'>
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
                                    <td>
                                        <div className='d-flex flex-row align-items-center justify-content-end'>
                                            <Button textOnly data-bs-dismiss='modal' data-bs-toggle='modal' data-bs-target='#cancelDropModal' onClick={() => onCancel?.(drop as DepositModel)}>
                                                <span className='me-2'>
                                                    <img src={Assets.images.cancel} alt='' />
                                                </span>
                                                <div style={{ textDecoration: 'underline' }}>Cancel</div>
                                            </Button>
                                            <Button className='ms-3' data-bs-dismiss='modal' data-bs-toggle='modal' data-bs-target='#editDepositModal' onClick={() => onEdit(drop as DepositModel)}>
                                                <span className='me-2'>
                                                    <img src={Assets.images.edit} alt='' />
                                                </span>
                                                Edit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                        <Button textOnly style={{ position: 'absolute', bottom: '1.75rem', left: 0 }} data-bs-dismiss='modal' data-bs-toggle='modal' data-bs-target='#cancelDropModal'>
                            <span className='me-2'>
                                <img src={Assets.images.cancel} alt='' />
                            </span>
                            <div style={{ textDecoration: 'underline' }}>Cancel All</div>
                        </Button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default DrawDetails;
