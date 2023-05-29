import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, SmallerDecimal } from 'components';
import { NavigationConstants } from 'constant';
import { DenomsUtils, NumbersUtils, StringsUtils } from 'utils';
import { PrizeModel } from 'models';

import './LuckiestWinnerCard.scss';

interface IProps {
    prize: PrizeModel;
}

const LuckiestWinnerCard = ({ prize }: IProps) => {
    return (
        <div className='luckiest-winner-card glow-bg h-100'>
            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(prize.amount.denom))} alt='winner-coin-icon' width='64' height='64' />
            <div className='d-flex flex-column align-items-center mt-3'>
                <h2 className='mb-0'>${numeral(NumbersUtils.convertUnitNumber(prize.amount.amount) * prize.usdTokenValue).format('0,0')}</h2>
                <small className='text-center'>
                    <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prize.amount.amount)).format('0,0.000000')} /> {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                </small>
            </div>
            <Button
                onClick={() => {
                    window.open(`${NavigationConstants.LUM_EXPLORER}/account/${prize.winnerAddress}`, '_blank')?.focus();
                }}
                outline
                className='luckiest-winner-address-btn mt-3'
                title={prize.winnerAddress}
            >
                <div className='address me-3'>{StringsUtils.trunc(prize.winnerAddress)}</div>
                <img src={Assets.images.arrow} alt='arrow' />
            </Button>
        </div>
    );
};

export default LuckiestWinnerCard;
