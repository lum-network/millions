import React from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';

import { SmallerDecimal, Table } from 'components';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';
import { MetadataModel, PrizeModel } from 'models';

import './LatestWinnersTable.scss';

interface IProps {
    prizes: PrizeModel[];
    metadata?: MetadataModel;
    onPageChange?: (page: number) => void;
}

const LatestWinnersTable = ({ prizes, metadata, onPageChange }: IProps) => {
    const renderRow = (prize: PrizeModel) => {
        return (
            <tr key={`winner-${prize.poolId}-${prize.drawId}-${prize.prizeId}`}>
                <td className='align-middle py-3 px-4 winner-infos'>
                    <span className='me-3'>
                        <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(prize.amount.denom))} alt={prize.amount.denom} width='38' height='38' />
                    </span>
                    {StringsUtils.trunc(prize.winnerAddress)}
                    <span className='prize-infos ms-3'>
                        ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} {I18n.t('pools.poolId', { poolId: prize.poolId }).toUpperCase()} -{' '}
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

    return (
        <Table pagination={metadata} onPageChange={onPageChange} className='latest-winners-table'>
            {prizes.map((prize) => renderRow(prize))}
        </Table>
    );
};

export default LatestWinnersTable;
