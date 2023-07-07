import React, { useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Location, Navigate } from 'react-router-dom';
import { Firebase } from 'utils';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { HomePage, MySavingsPage, PoolsPage, DepositPage, LandingPage, Error404, Winners, PoolDetailsPage } from 'pages';
import { DropsPoolsPage } from 'drops/pages';
import { MainLayout } from 'layout';

export const RouteListener = ({ location }: { location: Location }): JSX.Element | null => {
    useEffect(() => {
        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.SCREEN_VIEW, { screen_name: location.pathname });
    }, [location]);

    return null;
};

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<MainLayout />}>
            <Route path={NavigationConstants.HOME} element={<HomePage />} />
            <Route path={NavigationConstants.WINNERS} element={<Winners />} />
            <Route path={NavigationConstants.POOLS} element={<PoolsPage />} />
            <Route path={`${NavigationConstants.POOLS}/:denom/:poolId`} element={<DepositPage />} />
            <Route path={`${NavigationConstants.POOLS}/:denom`} element={<DepositPage />} />
            <Route path={`${NavigationConstants.POOL_DETAILS}/:denom`} element={<PoolDetailsPage />} />
            <Route path={`${NavigationConstants.POOL_DETAILS}/:denom/:poolId`} element={<PoolDetailsPage />} />
            <Route path={NavigationConstants.MY_SAVINGS} element={<MySavingsPage />} />
            <Route path={NavigationConstants.LANDING} element={<LandingPage />} />
            <Route path={NavigationConstants.DROPS}>
                <Route path={NavigationConstants.DROPS} element={<DropsPoolsPage />} />
                <Route path={NavigationConstants.DROPS_POOLS} element={<DropsPoolsPage />} />
            </Route>
            <Route path='*' element={<Error404 />} />
        </Route>,
    ),
);
