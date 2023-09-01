import React from 'react';
import { MetadataModel, PrizeModel } from 'models';
import { SmallerDecimal, Table, Tag } from 'components';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import dayjs from 'dayjs';
import { TagsConstants, PrizesConstants } from 'constant';
import numeral from 'numeral';

import './PrizesHistoryTable.scss';

interface IProps {
    prizes: PrizeModel[];
    onPageChange: (page: number) => void;
    pagination?: Partial<MetadataModel>;
}

const PrizesHistoryTable = ({ prizes, onPageChange, pagination }: IProps) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

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
                            <span className='denom ms-2'>{DenomsUtils.getNormalDenom(prize.amount.denom || 'ulum').toUpperCase()}</span>
                        </div>
                        {price && <small className='usd-price'>{numeral(NumbersUtils.convertUnitNumber(prize.amount.amount) * price).format('$0,0[.]00')}</small>}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <Table className='prizes-history' responsive={true} pagination={pagination} onPageChange={onPageChange} smallPadding>
            {prizes.map((prize, index) => renderRow(prize, index))}
        </Table>
    );
};

export default PrizesHistoryTable;
