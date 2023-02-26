import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Firebase } from 'utils';
import { FirebaseConstants } from 'constant';
import { HomePage } from 'pages';
import { MainLayout } from 'layout';

const RouteListener = (): JSX.Element | null => {
    const location = useLocation();

    useEffect(() => {
        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.SCREEN_VIEW, { screen_name: location.pathname });
    }, [location]);

    return null;
};

const RootNavigator = (): JSX.Element => {
    return (
        <Router>
            <RouteListener />
            <MainLayout>
                <Routes>
                    <Route path='/' element={<HomePage />} />
                </Routes>
            </MainLayout>
        </Router>
    );
};

export default RootNavigator;
