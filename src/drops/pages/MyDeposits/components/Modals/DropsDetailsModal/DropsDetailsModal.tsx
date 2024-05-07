/* eslint-disable max-len */

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

const DropsDetails = ({ drops, poolDenom, prices, modalRef, onCancel, onEdit }: Props) => {
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
                        <img src={DenomsUtils.getIconFromDenom(poolDenom)} alt={poolDenom} className='pool-icon no-filter' />
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
                                                <img src={Assets.images.depositDrop} alt='drops' className='no-filter' />
                                            </div>
                                            {StringsUtils.trunc(drop.winnerAddress || '')}
                                        </div>
                                    </td>
                                    <td className='text-md-end'>
                                        <div className='d-flex flex-column justify-content-center tx-amount'>
                                            <div className='amount text-nowrap'>
                                                {numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0, drop.amount?.denom) * (prices[poolDenom] || 0)).format('$0,0[.]00')}
                                            </div>
                                            <small className='usd-price'>
                                                <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(drop.amount?.amount || 0, drop.amount?.denom)).format('0,0.00')} /> {poolDenom.toUpperCase()}
                                            </small>
                                        </div>
                                    </td>
                                    <td>
                                        <div className='d-flex flex-row align-items-center justify-content-end'>
                                            <Button textOnly data-bs-dismiss='modal' data-bs-toggle='modal' data-bs-target='#cancelDropModal' onClick={() => onCancel?.(drop as DepositModel)}>
                                                <span className='me-2'>
                                                    <svg className='cancel-icon' width='11' height='10' viewBox='0 0 11 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                        <path
                                                            d='M9.9078 0.592198C9.30355 -0.0120486 8.32477 -0.0149446 7.71696 0.585716L5.5 2.7766L3.28304 0.585716C2.67523 -0.0149445 1.69645 -0.0120486 1.0922 0.592198C0.487951 1.19645 0.485055 2.17523 1.08572 2.78304L3.2766 5L1.08572 7.21696C0.485056 7.82477 0.487951 8.80355 1.0922 9.4078C1.69645 10.012 2.67523 10.0149 3.28304 9.41428L5.5 7.2234L7.71696 9.41428C8.32477 10.0149 9.30355 10.012 9.9078 9.4078C10.512 8.80355 10.5149 7.82477 9.91428 7.21696L7.7234 5L9.91428 2.78304C10.5149 2.17523 10.512 1.19645 9.9078 0.592198Z'
                                                            fill='#5634DE'
                                                        />
                                                    </svg>
                                                </span>
                                                <div style={{ textDecoration: 'underline' }}>Cancel</div>
                                            </Button>
                                            <Button className='ms-3' data-bs-dismiss='modal' data-bs-toggle='modal' data-bs-target='#editDepositModal' onClick={() => onEdit(drop as DepositModel)}>
                                                <span className='me-2'>
                                                    <svg className='edit-icon' width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                                        <path
                                                            d='M8.68735 5.29354C8.65277 5.25897 8.61687 5.22307 8.5823 5.18849C8.55438 5.16057 8.52645 5.13265 8.49986 5.10605C7.98793 4.59413 7.47601 4.0822 6.96408 3.57027C6.77659 3.38279 6.58778 3.1953 6.40029 3.00649C6.33647 2.94266 6.27265 2.87884 6.21015 2.81501C6.14766 2.75252 6.08516 2.69002 6.02267 2.62753C5.7913 2.85889 5.55861 3.09159 5.32724 3.32295C4.99216 3.65803 4.65708 3.99311 4.322 4.32819C3.93906 4.71114 3.55744 5.09276 3.17582 5.47438C2.7942 5.85599 2.41258 6.23761 2.03096 6.61923L1.03636 7.61383C0.80367 7.84653 0.570976 8.07922 0.338282 8.31191C0.274457 8.37574 0.210632 8.43956 0.146808 8.50339C0.0736753 8.57652 0.00985068 8.63503 0.00586163 8.7547C-0.00743517 9.10041 0.00586161 9.44879 0.00719129 9.79451C0.00719129 10.2466 0.00852095 10.6974 0.00852095 11.1495C0.00852095 11.176 0.00852095 11.204 0.00852095 11.2306C0.00852095 11.3742 0.129522 11.4965 0.274457 11.4965C0.618844 11.4965 0.963232 11.4965 1.30762 11.4978C1.76104 11.4978 2.21313 11.4992 2.66655 11.4992C2.70777 11.4992 2.74633 11.5005 2.78622 11.4952C2.85271 11.4859 2.90722 11.4526 2.95376 11.4074C2.99764 11.3635 3.04152 11.3197 3.0854 11.2758C3.28751 11.0737 3.48829 10.8729 3.69041 10.6708C4.00288 10.3583 4.31536 10.0458 4.62783 9.73334C5.00147 9.3597 5.37511 8.98606 5.75008 8.61109C6.13702 8.22415 6.52262 7.83855 6.90956 7.45161C7.25927 7.1019 7.6103 6.75087 7.96001 6.40116C8.22462 6.13656 8.48922 5.87195 8.75383 5.60734C8.79505 5.56612 8.8376 5.52357 8.88015 5.48235C8.81366 5.41986 8.75117 5.35736 8.68735 5.29354Z'
                                                            fill='white'
                                                        />
                                                        <path
                                                            d='M10.7743 2.49555C10.6706 2.39185 10.5669 2.28816 10.4619 2.18313C10.095 1.81621 9.72939 1.45062 9.36247 1.0837C9.24947 0.970702 9.13514 0.857701 9.02214 0.743371C8.95434 0.67557 8.87856 0.614417 8.79082 0.574535C8.55684 0.468181 8.2657 0.47084 8.04901 0.621064C7.93069 0.703488 7.83231 0.815159 7.72994 0.916195C7.55845 1.08769 7.38695 1.25919 7.21546 1.43068C7.00541 1.64073 6.79403 1.84945 6.58398 2.0595L9.06468 4.54019C9.12717 4.60268 9.18965 4.66516 9.25213 4.72764L9.43958 4.91509C9.52865 4.82602 9.61905 4.73562 9.70812 4.64655C9.99926 4.3554 10.2904 4.06426 10.5816 3.77312C10.6467 3.70798 10.7105 3.64416 10.7756 3.57902C10.7783 3.57636 10.7823 3.57238 10.785 3.56972C10.7889 3.56573 10.7916 3.56307 10.7956 3.55908C11.0788 3.25597 11.0681 2.79068 10.7743 2.49555Z'
                                                            fill='white'
                                                        />
                                                    </svg>
                                                </span>
                                                Edit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </Table>
                        <Button
                            textOnly
                            style={{ position: 'absolute', bottom: drops.deposits.length > 5 ? '1.75rem' : '-1rem', left: 0 }}
                            data-bs-dismiss='modal'
                            data-bs-toggle='modal'
                            data-bs-target='#cancelDropModal'
                        >
                            <span className='me-2'>
                                <svg className='cancel-icon' width='11' height='10' viewBox='0 0 11 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                    <path
                                        d='M9.9078 0.592198C9.30355 -0.0120486 8.32477 -0.0149446 7.71696 0.585716L5.5 2.7766L3.28304 0.585716C2.67523 -0.0149445 1.69645 -0.0120486 1.0922 0.592198C0.487951 1.19645 0.485055 2.17523 1.08572 2.78304L3.2766 5L1.08572 7.21696C0.485056 7.82477 0.487951 8.80355 1.0922 9.4078C1.69645 10.012 2.67523 10.0149 3.28304 9.41428L5.5 7.2234L7.71696 9.41428C8.32477 10.0149 9.30355 10.012 9.9078 9.4078C10.512 8.80355 10.5149 7.82477 9.91428 7.21696L7.7234 5L9.91428 2.78304C10.5149 2.17523 10.512 1.19645 9.9078 0.592198Z'
                                        fill='#5634DE'
                                    />
                                </svg>
                            </span>
                            <div style={{ textDecoration: 'underline' }}>Cancel All</div>
                        </Button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
};

export default DropsDetails;
