import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { PoolsConstants } from 'constant';
import { router } from 'navigation';
import { KeplrUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';

const Core = () => {
    const dispatch = useDispatch<Dispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.lumWallet);

    useEffect(() => {
        const autoConnect = async () => {
            if (KeplrUtils.isKeplrInstalled()) {
                await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: true, chainIds: Object.values(PoolsConstants.POOLS).map((pool) => pool.chainId) }).finally(() => null);
                await dispatch.wallet.connectOtherWallets();
            }
        };

        if (!wallet) {
            autoConnect().finally(() => null);
        }
    }, [wallet]);

    useEffect(() => {
        dispatch.stats.fetchStats().finally(() => null);
    }, []);

    return <RouterProvider router={router} />;
};

export default Core;
