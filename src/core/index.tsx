import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { router } from 'navigation';
import { Dispatch } from 'redux/store';

const Core = () => {
    const dispatch = useDispatch<Dispatch>();

    useEffect(() => {
        dispatch.stats.fetchStats().finally(() => null);
    }, []);

    return <RouterProvider router={router} />;
};

export default Core;
