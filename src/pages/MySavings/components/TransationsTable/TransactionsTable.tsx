import React from 'react';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { LumMessages } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import { SmallerDecimal, Table, Tooltip } from 'components';
import { TransactionModel } from 'models';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';

import './TransactionsTable.scss';
import { NavigationConstants } from 'constant';

const TransactionsTable = ({
    transactions,
    pagination,
    onPageChange,
}: {
    transactions: TransactionModel[];
    pagination?: {
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
        pagesTotal?: number;
        page?: number;
    };
    onPageChange: (page: number) => void;
}) => {
    const prices = useSelector((state: RootState) => state.stats.prices);
    const headers = I18n.t('mySavings.txListHeaders', { returnObjects: true });

    const renderRow = (transaction: TransactionModel, index: number) => {
        const price = prices?.[DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || '')];

        let type = '';
        let icon = '';

        switch (transaction.messages[0]) {
            case LumMessages.MsgMillionsDepositUrl:
                type = 'Deposit';
                icon = Assets.images.deposit;
                break;
            case LumMessages.MsgWithdrawDepositUrl:
                type = 'Leave Pool';
                icon = Assets.images.leavePool;
                break;
            case LumMessages.MsgClaimPrizeUrl:
                type = 'Claim Prize';
                icon = Assets.images.trophyPurple;
                break;
        }

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
                                    <img src={icon} alt='tx icon' />
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
                        <a className='tx-height ms-0 ms-sm-3 mt-3 mt-md-0 mt-lg-3 mt-xl-0' href={`${NavigationConstants.LUM_EXPLORER}/txs/${transaction.hash}`} rel='noreferrer' target='_blank'>
                            {StringsUtils.trunc(transaction.hash)}
                        </a>
                    </div>
                </td>
                <td data-label={headers[1]} className='align-bottom align-md-middle text-sm-end'>
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

    return (
        <Table className='transactions-table' pagination={pagination} onPageChange={onPageChange}>
            {transactions.map((transaction, index) => renderRow(transaction, index))}
        </Table>
    );
};

export default TransactionsTable;