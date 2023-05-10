import React, { useEffect, useState } from 'react';

import { I18n } from 'utils';

import { Button, Card, Lottie } from 'components';
import { NavigationConstants } from 'constant';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, Dispatch } from 'redux/store';

import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';

import LuckiestWinnerCard from './components/LuckiestWinnerCard/LuckiestWinnerCard';
import LatestWinnersTable from './components/LatestWinnersTable/LatestWinnersTable';

import './Winners.scss';

const Winners = () => {
    const dispatch = useDispatch<Dispatch>();

    const biggestPrizes = useSelector((state: RootState) => state.prizes.biggestPrizes);
    const latestPrizes = useSelector((state: RootState) => state.prizes.prizes);
    const metadataPrizes = useSelector((state: RootState) => state.prizes.metadata);

    const [page, setPage] = useState(0);

    useEffect(() => {
        dispatch.prizes.fetchPrizes({ page: page }).finally(() => null);
    }, [page]);

    return (
        <div className='luckiest-winners-container mt-3 mt-lg-5'>
            <h1 className='mb-0'>{I18n.t('luckiestWinners.title')}</h1>
            <div className='row gy-4 py-2 py-lg-4'>
                {biggestPrizes.length > 0 ? (
                    biggestPrizes.map((prize, index) => (
                        <div className='col-12 col-sm-6 col-lg-3' key={`winner-${index}`}>
                            <LuckiestWinnerCard prize={prize} />
                        </div>
                    ))
                ) : (
                    <div className='col-12'>
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
            {latestPrizes.length > 0 && metadataPrizes && (
                <>
                    <h1 className='mt-4'>
                        {I18n.t('luckiestWinners.latestWinners')} ({metadataPrizes.itemsTotal})
                    </h1>
                    <Card withoutPadding className='py-0 py-sm-2 py-xl-4 px-3 px-sm-4 px-xl-5 mt-2 mt-lg-4 glow-bg'>
                        <LatestWinnersTable prizes={latestPrizes} metadata={metadataPrizes} onPageChange={setPage} />
                        <Lottie
                            className='cosmonaut-rocket position-absolute start-0 top-100 translate-middle'
                            animationData={cosmonautWithRocket}
                            segments={[
                                [0, 30],
                                [30, 128],
                            ]}
                        />
                    </Card>
                </>
            )}
        </div>
    );
};

export default Winners;
