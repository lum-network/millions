import React from 'react';
import numeral from 'numeral';

import Assets from 'assets';
import { NavigationConstants } from 'constant';
import { DenomsUtils, StringsUtils } from 'utils';

import Button from '../Button/Button';

import './BigWinnerCard.scss';

const BigWinnerCard = ({ denom, address, prize, className }: { denom: string; address: string; prize: number; className?: string }) => {
    return (
        <Button to={NavigationConstants.WINNERS} outline className={`big-winner-card ${className}`}>
            <span className='prize text-nowrap'>
                <img width={20} height={20} src={DenomsUtils.getIconFromDenom(denom)} className='me-3' alt={denom} />
                {numeral(prize).format('0,0[.]0a')} {denom}
            </span>
            <div className='address'>{StringsUtils.trunc(address)}</div>
            <img src={Assets.images.arrow} alt='arrow' />
        </Button>
    );
};

export default BigWinnerCard;
