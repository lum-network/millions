import React from 'react';
import numeral from 'numeral';

import { Button, Collapsible, PurpleBackgroundImage, SmallerDecimal, Tooltip } from 'components';
import { Breakpoints, FirebaseConstants } from 'constant';
import { AggregatedDepositModel, DepositModel, PoolModel } from 'models';
import { useWindowSize } from 'hooks';
import { DenomsUtils, Firebase, I18n, NumbersUtils } from 'utils';
import Assets from 'assets';
import dayjs from 'dayjs';
import { DepositState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/deposit';
import { WithdrawalState } from '@lum-network/sdk-javascript/build/codegen/lum/network/millions/withdrawal';

import './DepositTable.scss';

interface IProps {
    deposits: AggregatedDepositModel[];
    pools: PoolModel[];
    prices: { [key: string]: number };
    onLeavePool: (deposit: DepositModel) => void;
    onDepositRetry: (deposit: DepositModel) => void;
    onWithdrawalRetry: (withdrawal: DepositModel) => void;
}

const DepositTable = ({ deposits, pools, prices, onLeavePool, onDepositRetry, onWithdrawalRetry }: IProps) => {
    const winSizes = useWindowSize();

    const renderGenericRow = (deposit: AggregatedDepositModel | Partial<DepositModel>, index: number, className?: string) => {
        let statusClassName = '';
        let cta: string | JSX.Element = '';

        switch (deposit.state) {
            case DepositState.DEPOSIT_STATE_SUCCESS:
                statusClassName = 'success';
                cta = deposit.isDepositDrop ? (
                    <span data-tooltip-id={`deposit-drop-${deposit.depositId?.toString() || index}-hint`} data-tooltip-html={I18n.t('mySavings.depositDropHint')} className='d-flex align-items-center'>
                        <Tooltip place='left' id={`deposit-drop-${deposit.depositId?.toString() || index}-hint`} />
                        <p className='me-3 mb-0'>{I18n.t('mySavings.depositDrop')}</p>
                        <img alt='Deposit drop' src={Assets.images.depositDrop} className='no-filter' />
                    </span>
                ) : (
                    <Button
                        textOnly
                        onClick={() => {
                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LEAVE_POOL_CLICK, {
                                pool_id: deposit.poolId?.toString(),
                                deposit_id: deposit.depositId?.toString(),
                                amount: NumbersUtils.convertUnitNumber(deposit.amount?.amount || 0),
                                denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
                            });
                            onLeavePool(deposit as DepositModel);
                        }}
                        data-bs-target='#leavePoolModal'
                        data-bs-toggle='modal'
                        className='h-100'
                        forcePurple
                    >
                        {I18n.t('mySavings.leavePoolCta')}
                    </Button>
                );
                break;

            case DepositState.DEPOSIT_STATE_FAILURE:
                statusClassName = 'failure';
                cta = <Button onClick={() => onDepositRetry(deposit as DepositModel)}>{I18n.t('common.retry')}</Button>;
                break;

            case DepositState.DEPOSIT_STATE_IBC_TRANSFER:
                // If the deposit is older than 1 hour, we consider it as failed
                if (deposit.updatedAt && dayjs().diff(dayjs(deposit.updatedAt), 'hours') > 1) {
                    statusClassName = 'failure';
                    cta = <Button onClick={() => onDepositRetry(deposit as DepositModel)}>{I18n.t('common.retry')}</Button>;
                } else {
                    statusClassName = 'pending';
                    cta = I18n.t('mySavings.transferWaitingCta');
                }
                break;

            case DepositState.DEPOSIT_STATE_ICA_DELEGATE:
                statusClassName = 'pending';
                cta = I18n.t('mySavings.transferWaitingCta');
                break;
        }

        if (deposit.isWithdrawing) {
            switch (deposit.withdrawalState) {
                case WithdrawalState.WITHDRAWAL_STATE_ICA_UNBONDING:
                    const pool = pools.find((p) => deposit.poolId && p.poolId === deposit.poolId);

                    const expiration = deposit.unbondingEndAt
                        ? dayjs(deposit.unbondingEndAt).toNow(true)
                        : pool && deposit.createdAt
                        ? dayjs(deposit.createdAt)
                              .add(pool.internalInfos ? pool.internalInfos.unbondingTime : 21, 'day')
                              .toNow(true)
                        : '';

                    cta = expiration + I18n.t('mySavings.depositUnbondingRemaining');
                    statusClassName = '';
                    break;

                case WithdrawalState.WITHDRAWAL_STATE_FAILURE:
                    statusClassName = 'failure';
                    if (deposit.withdrawalCanBeRetried) {
                        cta = <Button onClick={() => onWithdrawalRetry(deposit as DepositModel)}>{I18n.t('common.retry')}</Button>;
                    }
                    break;

                default:
                    statusClassName = '';
                    cta = '';
            }
        }

        const usdPrice = NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0') * prices[DenomsUtils.getNormalDenom(deposit.amount?.denom || '')] || 0;

        const ActionsContainer = ({ children }: { children: JSX.Element[] }) => {
            if (winSizes.width < Breakpoints.MD) {
                return <div className='row pt-3'>{children}</div>;
            }

            return <>{children}</>;
        };

        return (
            <div className={`${className}`} key={`deposit-${index}`}>
                <div className='col-12 col-md-6'>
                    <div className='d-flex flex-row align-items-center'>
                        <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' className='no-filter' />
                        <div className='d-flex flex-column ms-3'>
                            <h3 className='mb-0'>
                                <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0'))} />{' '}
                                {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                                {deposit.isSponsor && (
                                    <span data-tooltip-id={`deposit-${deposit.depositId?.toString() || index}-sponsor`} data-tooltip-html={I18n.t('mySavings.sponsorHint')} className='ms-2'>
                                        <PurpleBackgroundImage src={Assets.images.sponsor} width='20' height='20' alt='sponsor' className='mb-1 no-filter sponsorship-icon' />
                                        <Tooltip id={`deposit-${deposit.depositId?.toString() || index}-sponsor`} />
                                    </span>
                                )}
                            </h3>
                            <p className='mb-0'>
                                {numeral(usdPrice).format('$0,0[.]00')} - {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()} {I18n.t('pools.poolId')} -{' '}
                                {I18n.t('deposit.depositId', { depositId: deposit.depositId?.toString() || '' })}
                            </p>
                        </div>
                    </div>
                </div>
                <ActionsContainer>
                    <div className='col-12 col-sm-6 col-md-2'>
                        <div className={`deposit-state rounded-pill text-nowrap ${statusClassName}`}>
                            {!deposit.isWithdrawing
                                ? I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.state || DepositState.DEPOSIT_STATE_FAILURE]
                                : I18n.t('mySavings.withdrawalStates', { returnObjects: true })[deposit.withdrawalState || WithdrawalState.WITHDRAWAL_STATE_FAILURE]}
                        </div>
                    </div>
                    <div className='col-12 col-sm-6 col-md-4'>
                        <div className='d-flex justify-content-start justify-content-sm-end align-items-center h-100 mt-3 mt-sm-0'>
                            {typeof cta === 'string' ? <p className='text-muted mb-0'>{cta}</p> : cta}
                        </div>
                    </div>
                </ActionsContainer>
            </div>
        );
    };

    const renderRow = (deposit: AggregatedDepositModel, index: number) => {
        if (deposit.deposits.length > 1) {
            const usdPrice = NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0') * prices[DenomsUtils.getNormalDenom(deposit.amount?.denom || '')] || 0;

            return (
                <Collapsible
                    key={`collapsible-deposit-${index}`}
                    className='d-flex flex-column collapsible-deposits deposit-card'
                    buttonBorder={winSizes.width >= Breakpoints.SM}
                    toggleWithButton={winSizes.width >= Breakpoints.SM}
                    onCollapse={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSITS_CLOSE_DETAILS_CLICK)}
                    onExpand={() =>
                        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSITS_OPEN_DETAILS_CLICK, {
                            pool_id: deposit.poolId?.toString() || '',
                            deposits_number: deposit.deposits.length,
                            amount: NumbersUtils.convertUnitNumber(deposit.amount?.amount || ''),
                            denom: DenomsUtils.getNormalDenom(deposit.amount?.denom || ''),
                        })
                    }
                    header={
                        <div className='d-flex flex-column flex-md-row align-items-center w-100' key={`deposit-${index}`}>
                            <div className='col-12 col-md-6'>
                                <div className='d-flex flex-row align-items-center'>
                                    <img src={DenomsUtils.getIconFromDenom(deposit.amount?.denom || '')} alt='coin icon' width='40' height='40' className='no-filter' />
                                    <div className='d-flex flex-column ms-3'>
                                        <h3 className='mb-0'>
                                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(deposit.amount?.amount || '0'))} />{' '}
                                            {DenomsUtils.getNormalDenom(deposit.amount?.denom || '').toUpperCase()}
                                        </h3>
                                        <p className='mb-0'>
                                            {numeral(usdPrice).format('$0,0[.]00')} - {I18n.t('deposit.deposits', { count: deposit.deposits.length })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className='col-12 col-md-2'>
                                <div className={`deposit-state rounded-pill ${deposit.state === DepositState.DEPOSIT_STATE_SUCCESS ? 'success' : ''} mt-3 mt-md-0`}>
                                    {!deposit.isWithdrawing
                                        ? I18n.t('mySavings.depositStates', { returnObjects: true })[deposit.state || DepositState.DEPOSIT_STATE_FAILURE]
                                        : I18n.t('mySavings.withdrawalStates', { returnObjects: true })[deposit.withdrawalState || WithdrawalState.WITHDRAWAL_STATE_FAILURE]}
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
