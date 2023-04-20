import React from 'react';
import { LumTypes } from '@lum-network/sdk-javascript';
import { useSelector } from 'react-redux';
import numeral from 'numeral';

import Assets from 'assets';
import { Button } from 'components';
import { NavigationConstants } from 'constant';
import { RootState } from 'redux/store';
import { DenomsUtils, NumbersUtils, StringsUtils } from 'utils';

import './LuckiestWinnerCard.scss';

const LuckiestWinnerCard = ({ winner }: { winner: { amount: LumTypes.Coin; address: string } }) => {
    const prices = useSelector((state: RootState) => state.stats.prices);

    return (
        <div className='luckiest-winner-card glow-bg'>
            <img src={DenomsUtils.getIconFromDenom(DenomsUtils.getNormalDenom(winner.amount.denom))} alt='winner-coin-icon' width='64' height='64' />
            <div className='d-flex flex-column align-items-center mt-3'>
                <h2 className='mb-0'>${numeral(NumbersUtils.convertUnitNumber(winner.amount.amount) * (prices[DenomsUtils.getNormalDenom(winner.amount.denom)] || 1)).format('0,0')}</h2>
                <small>
                    {NumbersUtils.convertUnitNumber(winner.amount.amount)} {DenomsUtils.getNormalDenom(winner.amount.denom).toUpperCase()}
                </small>
            </div>
            <Button
                onClick={() => {
                    window.open(`${NavigationConstants.LUM_EXPLORER}/account/${winner.address}`, '_blank')?.focus();
                }}
                outline
                className='luckiest-winner-address-btn px-4 py-3 mt-3'
            >
                <div className='address me-3'>{StringsUtils.trunc(winner.address)}</div>
                <img src={Assets.images.arrow} alt='arrow' />
            </Button>
        </div>
    );
};

export default LuckiestWinnerCard;
