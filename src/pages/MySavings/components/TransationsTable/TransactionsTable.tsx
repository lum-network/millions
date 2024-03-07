import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { lum } from '@lum-network/sdk-javascript';

import { Pagination, SmallerDecimal, Table, Tooltip } from 'components';
import { Breakpoints, NavigationConstants } from 'constant';
import { useWindowSize } from 'hooks';
import { MetadataModel, TransactionModel } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils, TransactionsUtils } from 'utils';

import './TransactionsTable.scss';

const claimPrizeTypeUrl = lum.network.millions.MsgClaimPrize.typeUrl;

const TransactionsTable = ({
    transactions,
    pagination,
    onPageChange,
}: {
    transactions: TransactionModel[];
    pagination?: Omit<MetadataModel, 'itemsCount' | 'itemsTotal' | 'limit'>;
    onPageChange: (page: number) => void;
}) => {
    const [smallTableVisibleItem, setSmallTableVisibleItem] = useState(0);

    const prices = useSelector((state: RootState) => state.stats.prices);
    const winSizes = useWindowSize();

    const headers = I18n.t('mySavings.txListHeaders', { returnObjects: true });

    const renderRow = (transaction: TransactionModel, index: number) => {
        const price = prices?.[DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || '')];

        const { type, icon } = TransactionsUtils.getTxTypeAndIcon(transaction);

        return (
            <tr key={`transaction-${transaction.hash}-${index}`}>
                <td data-label={headers[0]} className='align-middle'>
                    <div
                        className={[
                            'd-flex flex-column flex-md-row flex-lg-column flex-xl-row',
                            'align-items-end align-items-md-baseline align-items-lg-end align-items-xl-baseline',
                            'justify-content-md-start justify-content-lg-end justify-content-xl-start',
                        ].join(' ')}
                    >
                        <div className='d-flex flex-row align-items-baseline'>
                            {icon && (
                                <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                    <img src={icon} alt='tx icon' className='no-filter' />
                                </div>
                            )}
                            <h4 className='mb-0 align-middle text-nowrap'>{type}</h4>
                            {transaction.messages.length > 1 ? (
                                <span
                                    data-tooltip-id={`claim-tooltip-${transaction.hash}`}
                                    data-tooltip-html={I18n.t(transaction.messages[0] === claimPrizeTypeUrl ? 'mySavings.transactionTooltips.claim' : 'mySavings.transactionTooltips.withdraw', {
                                        count: transaction.messages.length,
                                    })}
                                >
                                    <div className='msg-count-badge d-flex align-items-center justify-content-center ms-2 rounded-pill px-2 py-1'>+{transaction.messages.length - 1}</div>
                                    <Tooltip id={`claim-tooltip-${transaction.hash}`} />
                                </span>
                            ) : null}
                        </div>
                        <a className='tx-height ms-0 ms-sm-3 mt-3 mt-md-0 mt-lg-3 mt-xl-0' href={`${NavigationConstants.MINTSCAN}/tx/${transaction.hash}`} rel='noreferrer' target='_blank'>
                            {StringsUtils.trunc(transaction.hash)}
                        </a>
                    </div>
                </td>
                <td data-label={headers[2]} className='align-bottom align-md-middle text-sm-end'>
                    <div className='d-flex flex-column justify-content-center tx-amount'>
                        <div className='amount text-nowrap'>
                            {transaction.amount.length > 0 ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(transaction.amount[0].amount))} /> : '--'}
                            <span className='denom ms-2'>{DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || 'ulum').toUpperCase()}</span>
                        </div>
                        {price && <small className='usd-price'>{numeral(NumbersUtils.convertUnitNumber(transaction.amount[0].amount) * price).format('$0,0[.]00')}</small>}
                    </div>
                </td>
            </tr>
        );
    };

    const renderSmallTable = (transactions: TransactionModel[]) => {
        const renderItem = (transaction: TransactionModel, index: number) => {
            const price = prices?.[DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || '')];

            const { type, icon } = TransactionsUtils.getTxTypeAndIcon(transaction);

            return (
                <div key={`transaction-${index}`} className='d-flex flex-column mb-4'>
                    <div className='d-flex flex-column'>
                        <label>{headers[0]}</label>
                        <div className='d-flex flex-row align-items-baseline table-item'>
                            {icon && (
                                <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                    <img src={icon} alt='tx icon' className='no-filter' />
                                </div>
                            )}
                            <h4 className='mb-0 align-middle text-nowrap'>{type}</h4>
                            {transaction.messages.length > 1 ? (
                                <span data-tooltip-id={`claim-tooltip-${transaction.hash}`} data-tooltip-html={`${transaction.messages.length} prizes claimed`}>
                                    <div className='msg-count-badge d-flex align-items-center justify-content-center ms-2 rounded-pill px-2 py-1'>+{transaction.messages.length - 1}</div>
                                    <Tooltip id={`claim-tooltip-${transaction.hash}`} />
                                </span>
                            ) : null}
                        </div>
                    </div>
                    <div className='d-flex flex-column my-2'>
                        <label>{headers[1]}</label>
                        <div className='table-item'>
                            <a className='tx-height' href={`${NavigationConstants.MINTSCAN}/tx/${transaction.hash}`} rel='noreferrer' target='_blank'>
                                {StringsUtils.trunc(transaction.hash)}
                            </a>
                        </div>
                    </div>
                    <div className='d-flex flex-column'>
                        <label>{headers[2]}</label>
                        <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center tx-amount table-item'>
                            <div className='amount text-nowrap'>
                                {transaction.amount.length > 0 ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(transaction.amount[0].amount))} /> : '--'}
                                <span className='denom ms-2'>{DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || 'ulum').toUpperCase()}</span>
                            </div>
                            {price && <small className='usd-price'>{numeral(NumbersUtils.convertUnitNumber(transaction.amount[0].amount) * price).format('$0,0[.]00')}</small>}
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className='transactions-table py-3'>
                {renderItem(transactions[((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem], ((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem)}
                <div className='d-flex flex-row mt-4'>
                    <button
                        type='button'
                        className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn'
                        disabled={smallTableVisibleItem === 0 && !pagination?.hasPreviousPage}
                        onClick={() => {
                            if (smallTableVisibleItem === 0) {
                                if (pagination) {
                                    onPageChange(pagination.page - 1);
                                }
                                setSmallTableVisibleItem(4);
                            } else {
                                setSmallTableVisibleItem(smallTableVisibleItem - 1);
                            }
                        }}
                    >
                        {I18n.t('common.prev')}
                    </button>
                    <button
                        type='button'
                        className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn ms-4'
                        disabled={((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem === transactions.length - 1 && !pagination?.hasNextPage}
                        onClick={() => {
                            if (smallTableVisibleItem === 4) {
                                if (pagination) {
                                    onPageChange(pagination.page + 1);
                                }
                                setSmallTableVisibleItem(0);
                            } else {
                                setSmallTableVisibleItem(smallTableVisibleItem + 1);
                            }
                        }}
                    >
                        {I18n.t('common.next')}
                    </button>
                </div>
                {pagination && <Pagination pagination={pagination} onPageChange={onPageChange} customPagination='justify-content-center mt-4' />}
            </div>
        );
    };

    const normalTableTxs = pagination ? transactions.slice((pagination.page - 1) * 5, (pagination.page - 1) * 5 + 5) : transactions;

    return winSizes.width < Breakpoints.MD || (winSizes.width > Breakpoints.LG && winSizes.width < Breakpoints.XL) ? (
        renderSmallTable(transactions)
    ) : (
        <Table className='transactions-table' pagination={pagination} onPageChange={onPageChange}>
            {normalTableTxs.map((transaction, index) => renderRow(transaction, index))}
        </Table>
    );
};

export default TransactionsTable;
