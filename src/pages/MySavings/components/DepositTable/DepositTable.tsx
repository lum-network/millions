import React from 'react';
import dayjs from 'dayjs';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

import { Button, Collapsible, SmallerDecimal } from 'components';
import { AggregatedDepositModel, DepositModel } from 'models';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './DepositTable.scss';

interface IProps {
    deposits: AggregatedDepositModel[];
    onLeavePool: (deposit: DepositModel) => void;
}

const DepositTable = ({ deposits, onLeavePool }: IProps) => {
    const renderGenericRow = (deposit: AggregatedDepositModel | Partial<DepositModel>, index: number, className?: string) => {
        let statusClassName = '';
        let cta: string | JSX.Element = '';

        switch (deposit.state) {
            case DepositState.DEPOSIT_STATE_SUCCESS:
                statusClassName = 'success';
                cta = (
                    <Button textOnly onClick={() => onLeavePool(deposit as DepositModel)} data-bs-target='#leavePoolModal' data-bs-toggle='modal'>
                        {I18n.t('mySavings.leavePoolCta')}
                    </Button>
                );
                break;

            case DepositState.DEPOSIT_STATE_FAILURE:
                statusClassName = 'failure';
                cta = <Button>{I18n.t('common.retry')}</Button>;
                break;

            case DepositState.DEPOSIT_STATE_IBC_TRANSFER:
            case DepositState.DEPOSIT_STATE_ICA_DELEGATE:
                cta = I18n.t('mySavings.transferWaitingCta');
                break;
        }

        if (deposit.isWithdrawing) {
            cta = dayjs(deposit.unbondingEndAt).utc().diff(dayjs().utc(), 'day') + ' day(s) remaining';
            statusClassName = '';
        }

        return (
            <div className={`${className}`} key={`deposit-${index}`}>
                <div className='col-6'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' />
                        <div className='d-flex flex-column ms-3'>
                            <h3 className='mb-0'>
                                {NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0')} {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                            </h3>
                            <p className='mb-0'>
                                {I18n.t('pools.poolId', { poolId: deposit.poolId?.toString() || '' })} - {I18n.t('deposit.depositId', { depositId: deposit.depositId?.toString() || '' })}
                            </p>
                        </div>
                    </div>
                </div>
                <div className='col-2'>
                    <div className={`deposit-state rounded-pill ${statusClassName}`}>
                        {I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.isWithdrawing ? 5 : deposit.state || DepositState.DEPOSIT_STATE_FAILURE]}
                    </div>
                </div>
                <div className='col-4'>
                    <div className='d-flex justify-content-end'>{typeof cta === 'string' ? <p className='text-muted mb-0'>{cta}</p> : cta}</div>
                </div>
            </div>
        );
    };

    const renderRow = (deposit: AggregatedDepositModel, index: number) => {
        if (deposit.deposits.length > 1) {
            return (
                <Collapsible
                    key={`collapsible-deposit-${index}`}
                    className='d-flex flex-column collapsible-deposits deposit-card'
                    buttonBorder
                    toggleWithButton
                    header={
                        <div className='d-flex align-items-center w-100' key={`deposit-${index}`}>
                            <div className='col-6'>
                                <div className='d-flex flex-row align-items-center'>
                                    <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' />
                                    <div className='d-flex flex-column ms-3'>
                                        <h3 className='mb-0'>
                                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0'))} />{' '}
                                            {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                                        </h3>
                                        <p className='mb-0'>
                                            {I18n.t('pools.poolId', { poolId: deposit.poolId?.toString() || '' })} - {I18n.t('deposit.deposits', { count: deposits.length })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className='col-2'>
                                <div className={`deposit-state rounded-pill success`}>
                                    {I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.isWithdrawing ? 5 : deposit.state || DepositState.DEPOSIT_STATE_FAILURE]}
                                </div>
                            </div>
                        </div>
                    }
                    content={<>{deposit.deposits.map((deposit, index) => renderGenericRow(deposit, index, 'deposit-card-collapse'))}</>}
                    id={`collapsible-deposits-${index}`}
                />
            );
        }

        return renderGenericRow(deposit, index, 'deposit-card');
    };

    return <div className='deposits-table'>{deposits.map((deposit, index) => renderRow(deposit, index))}</div>;
};

export default DepositTable;
