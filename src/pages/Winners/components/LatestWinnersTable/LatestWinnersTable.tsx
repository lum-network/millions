import React from 'react';
import { LumTypes } from '@lum-network/sdk-javascript';
import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import { Table } from 'components';
import { RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils, StringsUtils } from 'utils';

import './LatestWinnersTable.scss';

const LatestWinnersTable = ({
    winners,
}: {
    winners: {
        address: string;
        amount: LumTypes.Coin;
        drawId: number;
        poolId: number;
        timestamp: Date;
    }[];
}) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

    const renderRow = (winner: { address: string; amount: LumTypes.Coin; drawId: number; poolId: number; timestamp: Date }) => {
        return (
            <tr key={`winner-${winner.poolId}-${winner.drawId}`}>
                <td className='align-middle py-3 px-4 winner-infos'>
                    <span className='me-3'>
                        <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(winner.amount.denom))} alt={winner.amount.denom} width='38' height='38' />
                    </span>
                    {StringsUtils.trunc(winner.address)}
                    <span className='prize-infos ms-3'>
                        ${DenomsUtils.getNormalDenom(winner.amount.denom).toUpperCase()} {I18n.t('pools.poolId', { poolId: winner.poolId }).toUpperCase()} -{' '}
                        {I18n.t('mySavings.claimModal.drawId', { drawId: winner.drawId }).toUpperCase()}
                    </span>
                    <span className='date ms-3'>{dayjs(winner.timestamp).format('D MMM YYYY')}</span>
                </td>
                <td className='py-3 px-4 align-middle text-end'>
                    <div className='d-flex flex-column winner-amount'>
                        <div>
                            {NumbersUtils.convertUnitNumber(winner.amount.amount)} <span className='denom'>{DenomsUtils.getNormalDenom(winner.amount.denom).toUpperCase()}</span>
                        </div>
                        <small className='usd-price'>
                            ${numeral(NumbersUtils.convertUnitNumber(winner.amount.amount) * (prices[DenomsUtils.getNormalDenom(winner.amount.denom)] || 1)).format('0,0.00')}
                        </small>
                    </div>
                </td>
            </tr>
        );
    };

    return <Table className='latest-winners-table'>{winners.map((winner) => renderRow(winner))}</Table>;
};

export default LatestWinnersTable;
