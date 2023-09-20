import React, { useState } from 'react';
import { MetadataModel, PrizeModel } from 'models';
import { Pagination, SmallerDecimal, Table, Tag } from 'components';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import dayjs from 'dayjs';
import { TagsConstants, PrizesConstants, Breakpoints } from 'constant';
import numeral from 'numeral';
import { useWindowSize } from 'hooks';

import './PrizesHistoryTable.scss';

interface IProps {
    prizes: PrizeModel[];
    onPageChange: (page: number) => void;
    pagination?: Omit<MetadataModel, 'itemsCount' | 'itemsTotal' | 'limit'>;
}

const PrizesHistoryTable = ({ prizes, onPageChange, pagination }: IProps) => {
    const [smallTableVisibleItem, setSmallTableVisibleItem] = useState(0);

    const prices = useSelector((state: RootState) => state.stats.prices);
    const winSizes = useWindowSize();

    const renderRow = (prize: PrizeModel, index: number) => {
        const icon = DenomsUtils.getIconFromDenom(prize.amount.denom);
        const normalDenom = DenomsUtils.getNormalDenom(prize.amount.denom);
        const amount = NumbersUtils.convertUnitNumber(prize.amount.amount);
        const price = prices?.[normalDenom];
        let tagType = TagsConstants.Types.UNCLAIMED;

        switch (prize.state) {
            case PrizesConstants.PrizeState.PENDING:
                tagType = TagsConstants.Types.UNCLAIMED;
                break;
            case PrizesConstants.PrizeState.CLAIMED:
                tagType = TagsConstants.Types.CLAIMED;
                break;
            case PrizesConstants.PrizeState.EXPIRED:
                tagType = TagsConstants.Types.EXPIRED;
        }

        return (
            <tr key={`prize-${prize.id}-${index}`}>
                <td className=''>{icon ? <img height={40} width={40} src={icon} alt={`${normalDenom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}</td>
                <td className=''>
                    <div className='d-flex flex-column'>
                        <h4 className='mb-1'>{I18n.t('mySavings.prizeWon')}</h4>
                        <p className='m-0 subtitle'>
                            {dayjs(prize.createdAt).format('ll').toUpperCase()} - {I18n.t('pools.poolId')} {normalDenom.toUpperCase()}
                        </p>
                    </div>
                </td>
                <td className=''>
                    <Tag type={tagType} />
                </td>
                <td>
                    <p className='m-0 expiration-date text-end'>
                        {prize.state === PrizesConstants.PrizeState.PENDING ? I18n.t('mySavings.prizeExpiration', { expiration: dayjs(prize.expiresAt).fromNow() }) : null}
                    </p>
                </td>
                <td className='text-end'>
                    <div className='d-flex flex-column justify-content-center tx-amount'>
                        <div className='amount text-nowrap'>
                            {prize.amount ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(prize.amount.amount), 3)} /> : '--'}
                            <span className='denom ms-2'>{DenomsUtils.getNormalDenom(prize.amount.denom || '').toUpperCase()}</span>
                        </div>
                        {price && <small className='usd-price'>{numeral(amount * (prize.usdTokenValue || price)).format('$0,0[.]00')}</small>}
                    </div>
                </td>
            </tr>
        );
    };

    const renderSmallTable = (prizes: PrizeModel[]) => {
        const renderItem = (prize: PrizeModel, index: number) => {
            if (!prize) {
                return null;
            }

            const icon = DenomsUtils.getIconFromDenom(prize.amount.denom);
            const normalDenom = DenomsUtils.getNormalDenom(prize.amount.denom);
            const amount = NumbersUtils.convertUnitNumber(prize.amount.amount);
            const price = prices?.[normalDenom];
            let tagType = TagsConstants.Types.UNCLAIMED;

            switch (prize.state) {
                case PrizesConstants.PrizeState.PENDING:
                    tagType = TagsConstants.Types.UNCLAIMED;
                    break;
                case PrizesConstants.PrizeState.CLAIMED:
                    tagType = TagsConstants.Types.CLAIMED;
                    break;
                case PrizesConstants.PrizeState.EXPIRED:
                    tagType = TagsConstants.Types.EXPIRED;
            }

            return (
                <div key={`prize-${index}`} className='d-flex flex-column mb-4'>
                    <div className='d-flex flex-column'>
                        <div className='d-flex flex-row align-items-center table-item'>
                            {icon ? <img height={40} width={40} src={icon} alt={`${normalDenom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                            <div className='ms-3 d-flex flex-column'>
                                <h4 className='mb-1'>{I18n.t('mySavings.prizeWon')}</h4>
                                <p className='m-0 subtitle'>
                                    {dayjs(prize.createdAt).format('ll').toUpperCase()} - {I18n.t('pools.poolId')} {normalDenom.toUpperCase()}
                                </p>
                            </div>
                        </div>
                        <div className='mt-3 d-flex flex-row justify-content-between align-items-center table-item'>
                            <Tag type={tagType} />
                            <p className='m-0 expiration-date text-end'>
                                {prize.state === PrizesConstants.PrizeState.PENDING ? I18n.t('mySavings.prizeExpiration', { expiration: dayjs(prize.expiresAt).fromNow() }) : null}
                            </p>
                        </div>
                        <div className='mt-3 d-flex flex-row justify-content-between align-items-center table-item'>
                            <div className='d-flex flex-column justify-content-center tx-amount'>
                                <div className='amount text-nowrap'>
                                    {prize.amount ? <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(prize.amount.amount), 3)} /> : '--'}
                                    <span className='denom ms-2'>{DenomsUtils.getNormalDenom(prize.amount.denom || '').toUpperCase()}</span>
                                </div>
                                {price && <small className='usd-price'>{numeral(amount * (prize.usdTokenValue || price)).format('$0,0[.]00')}</small>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        return (
            <div className='prizes-table py-3'>
                {renderItem(prizes[((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem], ((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem)}
                <div className='d-flex flex-row mt-4'>
                    <button
                        type='button'
                        className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn'
                        disabled={smallTableVisibleItem === 0 && (pagination?.page || 1) === 1}
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
                        disabled={((pagination?.page || 1) - 1) * 5 + smallTableVisibleItem === prizes.length - 1}
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

    return winSizes.width < Breakpoints.MD || (winSizes.width > Breakpoints.LG && winSizes.width < Breakpoints.XL) ? (
        renderSmallTable(prizes)
    ) : (
        <Table className='prizes-table' pagination={pagination} onPageChange={onPageChange} smallPadding>
            {prizes.map((prize, index) => renderRow(prize, index))}
        </Table>
    );
};

export default PrizesHistoryTable;
