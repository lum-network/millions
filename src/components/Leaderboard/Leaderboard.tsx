import React, { useEffect } from 'react';
import { LumTypes } from '@lum-network/sdk-javascript';

import { Button, SmallerDecimal } from 'components';
import { NumbersUtils, StringsUtils } from 'utils';

import Table from '../Table/Table';

import './Leaderboard.scss';

interface Props {
    items: {
        address: string;
        amount: LumTypes.Coin;
        rank?: number;
        me?: boolean;
    }[];
    className?: string;
    limit?: number;
    whiteCards?: boolean;
    onBottomReached?: () => void;
}

const Leaderboard = (props: Props) => {
    const { items, className, limit, whiteCards, onBottomReached } = props;

    const callback = () => {
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
            onBottomReached?.();
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', callback);

        return () => {
            window.removeEventListener('scroll', callback);
        };
    }, []);

    const renderRow = (item: { amount: LumTypes.Coin; address: string; me?: boolean; rank?: number }, index: number) => {
        const rank = item.rank || index + 1;

        return (
            <tr key={`depositor-rank-${rank}`} className={`${item.me ? 'me' : ''} ${whiteCards ? 'white-bg' : ''}`}>
                <td>
                    <div className='d-flex flex-row align-items-center'>
                        <div className={'me-3 rank' + ' ' + (rank === 1 ? 'first' : rank === 2 ? 'second' : rank === 3 ? 'third' : '')}>#{rank}</div>
                        <div className='address'>{StringsUtils.trunc(item.address, 3)}</div>
                    </div>
                </td>
                <td className='text-end'>
                    <div className='position-relative d-flex flex-row align-items-center justify-content-end'>
                        <div className='crypto-amount me-3'>
                            <SmallerDecimal nb={NumbersUtils.formatTo6digit(item.amount.amount)} /> {item.amount.denom.toUpperCase()}
                        </div>
                        <div className='usd-amount'>
                            $<SmallerDecimal nb={NumbersUtils.formatTo6digit(Number(item.amount.amount) * 1.982)} />
                        </div>
                        {!item.me && <Button className='deposit-more-btn'>Deposit More to take his place</Button>}
                    </div>
                </td>
            </tr>
        );
    };

    const list = limit ? items.slice(0, limit) : items;

    return (
        <div className={`leaderboard ${className}`}>
            <Table className='leaderboard-table'>{list.map(renderRow)}</Table>
        </div>
    );
};

export default Leaderboard;
