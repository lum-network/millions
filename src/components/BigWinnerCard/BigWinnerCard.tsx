import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { Breakpoints, FirebaseConstants, NavigationConstants } from 'constant';
import { DenomsUtils, Firebase, NumbersUtils, StringsUtils } from 'utils';

import Button from '../Button/Button';

import './BigWinnerCard.scss';
import { useWindowSize } from 'hooks';

interface IProps {
    denom: string;
    address: string;
    apr?: number;
    prize: number;
    className?: string;
    price: number;
}

const BigWinnerCard = ({ apr, denom, address, prize, className, price }: IProps) => {
    const { width: windowWidth } = useWindowSize();

    return (
        <Button
            to={NavigationConstants.WINNERS}
            outline
            className={`big-winner-card ${className}`}
            onClick={() =>
                Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LUCKIEST_WINNERS_CARD_CLICK, {
                    denom: DenomsUtils.getNormalDenom(denom),
                    address: address,
                    amount: NumbersUtils.convertUnitNumber(prize),
                })
            }
        >
            <span className='prize text-nowrap'>
                <img width={20} height={20} src={DenomsUtils.getIconFromDenom(denom)} className='me-3 d-none d-sm-inline-block' alt={denom} />
                {apr ? `APR: ${numeral(apr / 100).format('0,0%')}` : `$${numeral(prize * price).format('0,0[.]00a')}`}
            </span>
            <div className='address'>{StringsUtils.trunc(address, windowWidth <= Breakpoints.SM ? 3 : 6)}</div>
            <img src={Assets.images.arrow} alt='arrow' />
        </Button>
    );
};

export default BigWinnerCard;
