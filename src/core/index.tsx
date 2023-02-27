import React, { useEffect } from 'react';
import RootNavigator from 'navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import { KeplrUtils } from 'utils';

const Core = () => {
    const dispatch = useDispatch<Dispatch>();
    const wallet = useSelector((state: RootState) => state.wallet.lumWallet);

    useEffect(() => {
        const autoConnect = async () => {
            if (KeplrUtils.isKeplrInstalled()) {
                await dispatch.wallet.connectWallet({ silent: true }).finally(() => null);
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
