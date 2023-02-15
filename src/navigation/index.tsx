import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Firebase } from 'utils';

const RouteListener = (): JSX.Element | null => {
    const location = useLocation();

    useEffect(() => {
        // Firebase.analytics.setCurrentScreen(location.pathname);
    }, [location]);

    return null;
};

const RootNavigator = (): JSX.Element => {
    return (
        <Router>
            <RouteListener />
            <Routes>{/*<Route path="/" element={<HomePage />} />*/}</Routes>
        </Router>
    );
};

export default RootNavigator;
