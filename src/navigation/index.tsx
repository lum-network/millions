import React, { useEffect } from 'react';
import { createBrowserRouter, createRoutesFromElements, Route, Location } from 'react-router-dom';
import { Firebase } from 'utils';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { LandingPage, Error404 } from 'pages';
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
            <Route path={NavigationConstants.LANDING} element={<LandingPage />} />
            <Route path='*' element={<Error404 />} />
        </Route>,
    ),
);
