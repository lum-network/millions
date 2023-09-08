import React, { useEffect, useRef, useState } from 'react';

import { I18n } from 'utils';

import { ArrowButton, Button, Card, Lottie } from 'components';
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

    const biggestAprPrizes = useSelector((state: RootState) => state.prizes.biggestAprPrizes);
    const latestPrizes = useSelector((state: RootState) => state.prizes.prizes);
    const metadataPrizes = useSelector((state: RootState) => state.prizes.metadata);

    const [page, setPage] = useState(1);
    const [smallTableVisibleItem, setSmallTableVisibleItem] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);

    const scrollLeft = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
                left: -350,
                behavior: 'smooth',
            });
        }
    };

    const scrollRight = () => {
        if (containerRef.current) {
            containerRef.current.scrollBy({
                left: 350,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        dispatch.prizes.fetchPrizes({ page: page - 1 }).finally(() => null);
    }, [page]);

    return (
        <div className='luckiest-winners-container mt-3 mt-lg-5'>
            <div className='d-flex justify-content-between align-items-center'>
                <h1 className='mb-0'>{I18n.t('luckiestWinners.title')}</h1>
                <div className='d-flex'>
                    <ArrowButton className='me-3' onClick={scrollLeft} direction='left' />
                    <ArrowButton onClick={scrollRight} direction='right' />
                </div>
            </div>
            <div className='cards-list py-3' ref={containerRef}>
                {biggestAprPrizes.length > 0 ? (
                    biggestAprPrizes.map((prize, index) => (
                        <div className='me-xl-4 me-3' key={`winner-${index}`}>
                            <LuckiestWinnerCard prize={prize} rank={index + 1} />
                        </div>
                    ))
                ) : (
                    <div className='col-12'>
                        <Card className='no-winners d-flex flex-row align-items-center justify-content-between glow-bg'>
                            <Lottie animationData={cosmonautWithDuck} className='cosmonaut-duck' />
                            <div className='d-flex flex-column flex-lg-row justify-content-between align-items-lg-center flex-grow-1 infos'>
                                <div className='mb-3 mb-lg-0'>
                                    <h2>{I18n.t('luckiestWinners.noWinnersYet.title')}</h2>
                                    <p className='mb-0'>{I18n.t('luckiestWinners.noWinnersYet.description')}</p>
                                </div>
                                <Button to={NavigationConstants.POOLS}>{I18n.t('luckiestWinners.noWinnersYet.cta')}</Button>
                            </div>
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
                        <LatestWinnersTable
                            prizes={latestPrizes}
                            metadata={
                                metadataPrizes
                                    ? {
                                          ...metadataPrizes,
                                          page: metadataPrizes.page + 1,
                                      }
                                    : undefined
                            }
                            visibleItem={smallTableVisibleItem}
                            onItemChange={setSmallTableVisibleItem}
                            onPageChange={(page, prev) => {
                                setPage(page);
                                setSmallTableVisibleItem(prev ? 4 : 0);
                            }}
                        />
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
