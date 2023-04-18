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
                        <h4 className='mb-0'>
                            {type} {transaction.messages.length > 1 ? <span className='msg-count-badge ms-2 rounded-pill px-2 py-1'>+{transaction.messages.length - 1}</span> : null}
                        </h4>
                    </div>
                </td>
                <td className='align-middle p-3'>
                    <div className='d-flex flex-row align-items-center justify-content-end'>
                        {transaction.amount.length > 0 ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(transaction.amount[0].amount))} /> : '--'}
                        <h4 className='ms-2 mb-0'>{DenomsUtils.getNormalDenom(transaction.amount[0]?.denom || 'ulum').toUpperCase()}</h4>
                    </div>
                </td>
            </tr>
        );
    };

    return <Table className='transactions-table'>{transactions.map((transaction) => renderRow(transaction))}</Table>;
};

export default TransactionsTable;
