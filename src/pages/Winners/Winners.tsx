import React from 'react';

import { I18n } from 'utils';

import { Button, Card, Lottie } from 'components';
import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';

import LuckiestWinnerCard from './components/LuckiestWinnerCard/LuckiestWinnerCard';
import LatestWinnersTable from './components/LatestWinnersTable/LatestWinnersTable';

import './Winners.scss';
import { NavigationConstants } from 'constant';

const luckiestWinners: {
    address: string;
    amount: {
        amount: string;
        denom: string;
    };
}[] = [
    /* {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '100000000',
            denom: 'uatom',
        },
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '100000000',
            denom: 'uosmo',
        },
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '50000000',
            denom: 'uevmos',
        },
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '20000000',
            denom: 'ucro',
        },
    }, */
];

const latestWinners = [
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '1000000',
            denom: 'uatom',
        },
        poolId: 1,
        drawId: 1,
        timestamp: new Date(),
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '1000000',
            denom: 'uosmo',
        },
        poolId: 1,
        drawId: 1,
        timestamp: new Date(),
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '1000000',
            denom: 'uevmos',
        },
        poolId: 1,
        drawId: 1,
        timestamp: new Date(),
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '1000000',
            denom: 'ucro',
        },
        poolId: 1,
        drawId: 1,
        timestamp: new Date(),
    },
    {
        address: 'lum13wqpfyc4rl5rqawg6f9xur6gdvgxfhm2ysl35f',
        amount: {
            amount: '1000000',
            denom: 'ulum',
        },
        poolId: 1,
        drawId: 1,
        timestamp: new Date(),
    },
];

const Winners = () => {
    return (
        <div className='luckiest-winners-container mt-3 mt-lg-5'>
            <h1 className='mb-0'>{I18n.t('luckiestWinners.title')}</h1>
            <div className='row gy-4 py-2 py-lg-4'>
                {luckiestWinners.length > 0 ? (
                    luckiestWinners.map((winner, index) => (
                        <div className='col-12 col-sm-6 col-lg-3' key={`winner-${index}`}>
                            <LuckiestWinnerCard winner={winner} />
                        </div>
                    ))
                ) : (
                    <div className='col-10'>
                        <Card className='no-winners d-flex flex-row align-items-center justify-content-between glow-bg'>
                            <Lottie animationData={cosmonautWithDuck} className='cosmonaut-duck' />
                            <div className='infos'>
                                <h2>You could be here!</h2>
                                <p className='mb-0'>{"Participating in this drawing has a higher\nchance of winning, so don't delay!"}</p>
                            </div>
                            <Button to={NavigationConstants.POOLS}>Deposit in Pool</Button>
                        </Card>
                    </div>
                )}
            </div>
            <h1 className='mt-4'>{I18n.t('luckiestWinners.latestWinners')}</h1>
            <Card withoutPadding className='py-0 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5 mt-2 mt-lg-4 glow-bg'>
                <LatestWinnersTable winners={latestWinners} />
                <Lottie className='cosmonaut-rocket position-absolute start-0 top-100 translate-middle' animationData={cosmonautWithRocket} />
            </Card>
        </div>
    );
};

export default Winners;
