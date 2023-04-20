import React from 'react';
import { LumMessages } from '@lum-network/sdk-javascript';

import Assets from 'assets';
import { SmallerDecimal, Table } from 'components';
import { TransactionModel } from 'models';
import { DenomsUtils, NumbersUtils } from 'utils';

import './TransactionsTable.scss';

const TransactionsTable = ({ transactions }: { transactions: TransactionModel[] }) => {
    const renderRow = (transaction: TransactionModel) => {
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
                icon = Assets.images.claim;
                break;
        }

        return (
            <tr key={`transaction-${transaction.hash}`}>
                <td className='align-middle p-3'>
                    <div className='d-flex flex-row align-items-center'>
                        {icon && (
                            <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                <img src={icon} alt='tx icon' />
                            </div>
                        )}
                        <h4 className='mb-0 align-middle'>{type}</h4>
                        {transaction.messages.length > 1 ? (
                            <div className='msg-count-badge d-flex align-items-center justify-content-center ms-2 rounded-pill px-2 py-1'>+{transaction.messages.length - 1}</div>
                        ) : null}
                    </div>
                </td>
                <td className='align-middle text-end p-3'>
                    <h4 className='mb-0 align-middle'>
                        <span className='me-2 amount'>
                            {transaction.amount.length > 0 ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(transaction.amount[0].amount))} /> : '--'}
                        </span>
                        {DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || 'ulum').toUpperCase()}
                    </h4>
                </td>
            </tr>
        );
    };

    return <Table className='transactions-table'>{transactions.map((transaction) => renderRow(transaction))}</Table>;
};

export default TransactionsTable;
