import React, { useEffect } from 'react';
import RootNavigator from 'navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import { KeplrUtils } from 'utils';
import { PoolsConstants } from 'constant';

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

    return <RootNavigator />;
};

export default Core;
