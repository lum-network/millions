import React from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

import { Button, Table } from 'components';
import { DepositModel } from 'models';
import { Dispatch } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './DepositTable.scss';

const DepositTable = ({ deposits }: { deposits: DepositModel[] }) => {
    const dispatch = useDispatch<Dispatch>();
    const onLeavePool = async (deposit: DepositModel) => {
        await dispatch.wallet.leavePool({
            poolId: deposit.poolId,
            depositId: deposit.depositId,
            denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
        });
    };

    const renderRow = (deposit: DepositModel) => {
        let statusClassName = '';
        let cta: string | JSX.Element = '';

        switch (deposit.state) {
            case DepositState.DEPOSIT_STATE_SUCCESS:
                statusClassName = 'success';
                cta = (
                    <Button textOnly onClick={async () => await onLeavePool(deposit)}>
                        Leave Pool
                    </Button>
                );
                break;

            case DepositState.DEPOSIT_STATE_FAILURE:
                statusClassName = 'failure';
                cta = <Button>Retry</Button>;
                break;

            case DepositState.DEPOSIT_STATE_IBC_TRANSFER:
            case DepositState.DEPOSIT_STATE_ICA_DELEGATE:
                cta = 'Usually ~1 minute';
                break;
        }

        if (deposit.isWithdrawing) {
            cta = dayjs(deposit.unbondingEndAt).utc().diff(dayjs().utc(), 'day') + ' day(s) remaining';
            statusClassName = '';
        }

        return (
            <tr key={`deposit-${deposit.depositId.toString()}`}>
                <td className='align-middle'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' />
                        <div className='d-flex flex-column ms-3'>
                            <h3 className='mb-0'>
                                {NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0')} {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                            </h3>
                            <p className='mb-0'>
                                Pool #{deposit.poolId.toString()} - Deposit #{deposit.depositId.toString()}
                            </p>
                        </div>
                    </div>
                </td>
                <td className='align-middle'>
                    <div className={`deposit-state rounded-pill ${statusClassName}`}>{I18n.t('myPlace.depositStates', { returnObjects: true })[deposit.isWithdrawing ? 5 : deposit.state]}</div>
                </td>
                <td className='align-middle'>
                    <div className='d-flex justify-content-end'>{typeof cta === 'string' ? <p className='text-muted mb-0'>{cta}</p> : cta}</div>
                </td>
            </tr>
        );
    };

    return <Table className='deposits-table'>{deposits.map((deposit) => renderRow(deposit))}</Table>;
};

export default DepositTable;
