import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { SmallerDecimal, Card } from 'components';
import { Breakpoints, NavigationConstants } from 'constant';
import { DenomsUtils, I18n, StringsUtils } from 'utils';
import { BiggestAprPrizeModel } from 'models';
import { useWindowSize } from 'hooks';
import { RootState } from 'redux/store';
import { useSelector } from 'react-redux';

import './LuckiestWinnerCard.scss';

interface IProps {
    prize: BiggestAprPrizeModel;
    rank: number;
}

const LuckiestWinnerCard = ({ prize, rank }: IProps) => {
    const { width: windowWidth } = useWindowSize();

    const prices = useSelector((state: RootState) => state.stats.prices);

    const denom = DenomsUtils.getNormalDenom(prize.denom);
    const icon = DenomsUtils.getIconFromDenom(prize.denom);
    const price = prices?.[denom];

    return (
        <Card
            onClick={() => {
                window.open(`${NavigationConstants.MINTSCAN_LUM}/address/${prize.address}`, '_blank')?.focus();
            }}
            className='luckiest-winner-card p-3 p-xl-4'
            withoutPadding
        >
            <div className='d-flex flex-row align-items-center'>
                <div className={'me-3 rank' + ' ' + (rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : '')}>#{rank}</div>
                <div className='address'>{StringsUtils.trunc(prize.address, windowWidth < Breakpoints.SM ? 3 : 6)}</div>
            </div>
            <Card flat withoutPadding className='mt-3 p-3'>
                <div className='d-flex justify-content-between align-items-center pb-3'>
                    <div className='d-flex align-items-center title'>
                        <img className='me-2' alt='apr' src={Assets.images.dollarIcon} />
                        {I18n.t('luckiestWinners.card.apr')}
                    </div>
                    <div className='value'>{numeral(prize.apr).format('0,0[.]00')}%</div>
                </div>
                <div className='d-flex justify-content-between align-items-center separator py-3'>
                    <div className='d-flex align-items-center title'>
                        <img className='me-2 no-filter' alt={denom} src={icon} width={18} height={18} />
                        {I18n.t('luckiestWinners.card.pool')}
                    </div>
                    <div className='value'>{denom.toUpperCase()}</div>
                </div>
                <div className='d-flex justify-content-between align-items-center separator py-3'>
                    <div className='d-flex align-items-center title'>
                        <img className='me-2' alt='apr' src={Assets.images.deposit} />
                        {I18n.t('luckiestWinners.card.deposit')}
                    </div>
                    <div className='value text-end'>
                        <div className='amount'>{numeral(prize.sumOfDeposits * price).format('$0,0')}</div>
                        <SmallerDecimal nb={numeral(prize.sumOfDeposits).format(prize.sumOfDeposits < 10 ? '0,0.000' : '0,0')} /> <span className='denom'>{denom.toUpperCase()}</span>
                    </div>
                </div>
                <div className='d-flex justify-content-between align-items-center separator pt-3'>
                    <div className='d-flex align-items-center title'>
                        <img className='me-2' alt='apr' src={Assets.images.trophyPurple} />
                        {I18n.t('luckiestWinners.card.win')}
                    </div>
                    <div className='value text-end'>
                        <div className='amount'>{numeral(prize.amount * price).format('$0,0')}</div>
                        <SmallerDecimal nb={numeral(prize.amount).format(prize.amount < 10 ? '0,0.000' : '0,0')} /> <span className='denom'>{denom.toUpperCase()}</span>
                    </div>
                </div>
            </Card>
        </Card>
    );
};

export default LuckiestWinnerCard;
