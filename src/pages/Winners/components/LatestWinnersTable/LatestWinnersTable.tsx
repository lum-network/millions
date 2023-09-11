import React from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';

import { Pagination, SmallerDecimal, Table } from 'components';
import { Breakpoints } from 'constant';
import { useWindowSize } from 'hooks';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';
import { MetadataModel, PrizeModel } from 'models';

import './LatestWinnersTable.scss';

interface IProps {
    prizes: PrizeModel[];
    visibleItem: number;
    onItemChange: (item: number) => void;
    metadata?: MetadataModel;
    onPageChange?: (page: number, prev?: boolean) => void;
}

const LatestWinnersTable = ({ prizes, metadata, visibleItem, onPageChange, onItemChange }: IProps) => {
    const winSizes = useWindowSize();

    const headers = I18n.t('luckiestWinners.winnersHeaders', { returnObjects: true });

    const renderRow = (prize: PrizeModel) => {
        return (
            <tr className='d-block d-lg-table-row' key={`winner-${prize.poolId}-${prize.drawId}-${prize.prizeId}`}>
                <td className='align-middle py-3 px-4 winner-infos'>
                    <span className='me-3'>
                        <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(prize.amount.denom))} alt={prize.amount.denom} width='38' height='38' className='no-filter' />
                    </span>
                    {StringsUtils.trunc(prize.winnerAddress)}
                    <span className='prize-infos ms-3'>
                        ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} {I18n.t('pools.poolId').toUpperCase()} -{' '}
                        {I18n.t('mySavings.claimModal.drawId', { drawId: prize.drawId }).toUpperCase()}
                    </span>
                    <span className='date ms-3'>{dayjs(prize.createdAt).format('D MMM YYYY')}</span>
                </td>
                <td className='py-3 px-4 align-bottom align-md-middle text-end'>
                    <div className='d-flex flex-column winner-amount'>
                        <div className='text-nowrap'>
                            <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prize.amount.amount)).format('0,0.000000')} />{' '}
                            <span className='denom'>{DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}</span>
                        </div>
                        <small className='usd-price'>${numeral(NumbersUtils.convertUnitNumber(prize.amount.amount) * prize.usdTokenValue).format('0,0.00')}</small>
                    </div>
                </td>
            </tr>
        );
    };

    const renderSmallTableItem = (prize: PrizeModel) => {
        if (prize === undefined) {
            return;
        }

        return (
            <div key={`prize-${prize.prizeId}`} className='d-flex flex-column mb-4'>
                <div className='d-flex flex-column'>
                    <label>{headers[0]}</label>
                    <div className='d-flex flex-row align-items-baseline table-item'>
                        <span className='me-3'>
                            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(prize.amount.denom))} alt={prize.amount.denom} width='38' height='38' />
                        </span>
                        {StringsUtils.trunc(prize.winnerAddress)}
                    </div>
                </div>
                <div className='d-flex flex-column my-2'>
                    <label>{headers[1]}</label>
                    <div className='table-item'>
                        <span className='prize-infos'>
                            ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} {I18n.t('pools.poolId', { poolId: prize.poolId }).toUpperCase()} -{' '}
                            {I18n.t('mySavings.claimModal.drawId', { drawId: prize.drawId }).toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className='d-flex flex-column'>
                    <label>{headers[2]}</label>
                    <div className='table-item'>
                        <span className='date'>{dayjs(prize.createdAt).format('D MMM YYYY')}</span>
                    </div>
                </div>
                <div className='d-flex flex-column mt-2'>
                    <label>{headers[3]}</label>
                    <div className='d-flex flex-row justify-content-between align-items-center tx-amount table-item'>
                        <div className='d-flex flex-column winner-amount'>
                            <div className='text-nowrap'>
                                <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prize.amount.amount)).format('0,0.000000')} />{' '}
                                <span className='denom'>{DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}</span>
                            </div>
                            <small className='usd-price'>${numeral(NumbersUtils.convertUnitNumber(prize.amount.amount) * prize.usdTokenValue).format('0,0.00')}</small>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderSmallTable = (prizes: PrizeModel[]) => {
        return (
            <div className='latest-winners-table py-3'>
                {renderSmallTableItem(prizes[visibleItem])}
                <div className='d-flex flex-row mt-4'>
                    <button
                        type='button'
                        className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn'
                        disabled={visibleItem === 0 && !metadata?.hasPreviousPage}
                        onClick={() => {
                            if (visibleItem === 0) {
                                if (metadata && onPageChange) {
                                    onPageChange(metadata.page - 1, true);
                                }
                            } else {
                                onItemChange(visibleItem - 1);
                            }
                        }}
                    >
                        {I18n.t('common.prev')}
                    </button>
                    <button
                        type='button'
                        className='d-flex align-items-center justify-content-center py-1 w-100 selectable-btn ms-4'
                        disabled={!metadata?.hasNextPage && visibleItem === prizes.length - 1}
                        onClick={() => {
                            if (visibleItem === prizes.length - 1) {
                                if (metadata && onPageChange) {
                                    onPageChange(metadata.page + 1);
                                }
                            } else {
                                onItemChange(visibleItem + 1);
                            }
                        }}
                    >
                        {I18n.t('common.next')}
                    </button>
                </div>
                {metadata && onPageChange && <Pagination pagination={metadata} onPageChange={onPageChange} customPagination='justify-content-center mt-4' />}
            </div>
        );
    };

    return winSizes.width < Breakpoints.LG ? (
        renderSmallTable(prizes)
    ) : (
        <Table pagination={metadata} onPageChange={onPageChange} className='latest-winners-table'>
            {prizes.map((prize) => renderRow(prize))}
        </Table>
    );
};

export default LatestWinnersTable;
