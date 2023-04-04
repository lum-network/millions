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
        }

        return (
            <tr key={`transaction-${transaction.hash}`}>
                <td className='align-middle'>
                    <div className='d-flex flex-row align-items-center'>
                        {icon && (
                            <div className='tx-icon-container d-flex align-items-center justify-content-center me-3'>
                                <img src={icon} alt='tx icon' />
                            </div>
                        )}
                        <h4 className='mb-0'>{type}</h4>
                    </div>
                </td>
                <td className='align-middle'>
                    <div className='d-flex flex-row align-items-center justify-content-end'>
                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(transaction.amount[0].amount))} />
                        <h4 className='ms-2 mb-0'>{DenomsUtils.getNormalDenom(transaction.amount[0].denom).toUpperCase()}</h4>
                    </div>
                </td>
            </tr>
        );
    };

    return <Table className='transactions-table'>{transactions.map((transaction) => renderRow(transaction))}</Table>;
};

export default TransactionsTable;
