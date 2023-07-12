import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { DenomsUtils, Firebase, NumbersUtils, StringsUtils } from 'utils';

import Button from '../Button/Button';

import './BigWinnerCard.scss';

interface IProps {
    denom: string;
    address: string;
    prize: number;
    className?: string;
    price: number;
}

const BigWinnerCard = ({ denom, address, prize, className, price }: IProps) => {
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
                <img width={20} height={20} src={DenomsUtils.getIconFromDenom(denom)} className='me-3' alt={denom} />${numeral(NumbersUtils.convertUnitNumber(prize * price)).format('0,0[.]00a')}
            </span>
            <div className='address'>{StringsUtils.trunc(address)}</div>
            <img src={Assets.images.arrow} alt='arrow' />
        </Button>
    );
};

export default BigWinnerCard;
