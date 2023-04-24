import React from 'react';
import dayjs from 'dayjs';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';

import Assets from 'assets';
import { Button, Table } from 'components';
import { AggregatedDepositModel, DepositModel } from 'models';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './DepositTable.scss';

interface IProps {
    deposits: AggregatedDepositModel[];
    onLeavePool: (deposit: DepositModel) => void;
}

const DepositTable = ({ deposits, onLeavePool }: IProps) => {
    const renderGenericRow = (deposit: AggregatedDepositModel | Partial<DepositModel>, index: number, depositsCount: number, className?: string) => {
        let statusClassName = '';
        let cta: string | JSX.Element = '';

        switch (deposit.state) {
            case DepositState.DEPOSIT_STATE_SUCCESS:
                statusClassName = 'success';
                cta = (
                    <Button textOnly onClick={() => onLeavePool(deposit as DepositModel)} data-bs-target='#leavePoolModal' data-bs-toggle='modal' className='h-100'>
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

        const cellPadding = depositsCount === 1 ? '' : index !== depositsCount - 1 ? 'py-4' : 'pt-4 pb-0';

        return (
            <tr className={className} key={`deposit-${deposit.poolId?.toString()}-${deposit.depositId?.toString()}`}>
                <td className={`pe-0 ps-sm-4 ps-xl-5 ${className}`}>
                    <div className={`d-flex flex-row align-items-center h-100 ${cellPadding}`}>
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
                </td>
                <td className={`px-0 ${className}`}>
                    <div className={`d-flex flex-row align-items-center h-100 ${cellPadding}`}>
                        <div className={`deposit-state rounded-pill ${statusClassName}`}>
                            {I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.isWithdrawing ? 5 : deposit.state || DepositState.DEPOSIT_STATE_FAILURE]}
                        </div>
                    </div>
                </td>
                <td className={`ps-0 pe-sm-4 pe-xl-5 ${className}`}>
                    <div className={`d-flex flex-row align-items-center justify-content-end h-100 ${cellPadding}`}>{typeof cta === 'string' ? <p className='text-muted my-auto'>{cta}</p> : cta}</div>
                </td>
            </tr>
        );
    };

    const renderCollapsibleRow = (deposit: AggregatedDepositModel, index: number) => {
        return (
            <>
                <tr key={`collapsible-deposit-${index}`} className='collapsible-row'>
                    <td className='pe-0 py-4 ps-sm-4 ps-xl-5'>
                        <div className='d-flex flex-row flex-shrink-1'>
                            <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' />
                            <div className='d-flex flex-column ms-3'>
                                <h3 className='mb-0'>
                                    {NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0').toFixed(0))}{' '}
                                    {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                                </h3>
                                <p className='mb-0'>
                                    {I18n.t('pools.poolId', { poolId: deposit.poolId?.toString() || '' })} - {deposit.deposits.length} Deposits
                                </p>
                            </div>
                        </div>
                    </td>
                    <td className='px-0 py-4'>
                        <div className={`deposit-state rounded-pill success`}>
                            {I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.isWithdrawing ? 5 : deposit.state || DepositState.DEPOSIT_STATE_FAILURE]}
                        </div>
                    </td>
                    <td className='pe-0 py-4 pe-sm-4 pe-xl-5'>
                        <Button type='button' outline className='ms-auto text-nowrap' data-bs-toggle='collapse' data-bs-target={`#collapsible-deposits-${index}`}>
                            Details
                            <span>
                                <img src={Assets.images.arrow} alt='arrow' className='ms-3 collapse-arrow' />
                            </span>
                        </Button>
                    </td>
                </tr>
                <tr>
                    <td colSpan={4} className='p-0' />
                </tr>
                <tr className='collapse-row'>
                    <td colSpan={4} className='p-0'>
                        <div id={`collapsible-deposits-${index}`} className='collapse'>
                            <table className='table table-borderless mb-0 w-100'>
                                <tbody>
                                    <tr></tr>
                                    {deposit.deposits.map((d, index) => renderGenericRow(d, index, deposit.deposits.length, 'collapsed-row py-0'))}
                                    <tr></tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </>
        );
    };

    const renderRow = (deposit: AggregatedDepositModel, index: number, depositsCount: number) => {
        if (deposit.deposits.length > 1) {
            return (
                <>
                    {renderCollapsibleRow(deposit, index)}
                    {index < depositsCount - 1 && <tr></tr>}
                </>
            );
        }

        return (
            <>
                {renderGenericRow(deposit, index, 1, 'py-4')}
                {index < depositsCount - 1 && <tr></tr>}
            </>
        );
    };

    return (
        <Table className='deposits-table' responsive={false}>
            {deposits.map((deposit, index) => renderRow(deposit, index, deposits.length))}
        </Table>
    );
};

export default DepositTable;
