import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';

import infoIcon from 'assets/images/info.svg';
import keplrIcon from 'assets/images/keplr.svg';
import { Button, Card, Header, Modal } from 'components';
import { NavigationConstants } from 'constant';
import { useVisibilityState } from 'hooks';
import { Dispatch, RootState } from 'redux/store';
import { LOGOUT } from 'redux/constants';
import { RouteListener } from 'navigation';
import { I18n, KeplrUtils, ToastUtils } from 'utils';

import './MainLayout.scss';

const MainLayout = () => {
    const [enableAutoConnect, setEnableAutoConnect] = useState(true);
    const [balanceFetchInterval, setBalanceFetchInterval] = useState<NodeJS.Timeout | null>(null);

    const location = useLocation();

    const keplrModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const logoutModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const wallet = useSelector((state: RootState) => state.wallet.lumWallet);

    const appLoading = useSelector((state: RootState) => state.loading.effects.app.init);

    const dispatch = useDispatch<Dispatch>();
    const store = useStore();
    const visibilityState = useVisibilityState();

    useEffect(() => {
        const autoConnect = async () => {
            await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: enableAutoConnect === true }).finally(() => null);
            await dispatch.wallet.connectOtherWallets(null);
        };

        if (!wallet && KeplrUtils.isKeplrInstalled() && location.pathname !== NavigationConstants.LANDING && enableAutoConnect) {
            autoConnect().finally(() => null);
        }
    }, [wallet, location, enableAutoConnect]);

    useEffect(() => {
        if (location.pathname === NavigationConstants.LANDING) {
            setEnableAutoConnect(false);
        }

        if (location.state?.autoConnect) {
            setEnableAutoConnect(true);
        }
    }, [location]);

    useEffect(() => {
        if (visibilityState === 'visible') {
            if (wallet && location.pathname !== NavigationConstants.POOLS) {
                // DISABLE Auto refresh for now

                //dispatch.wallet.reloadWalletInfos(wallet.address);
                setBalanceFetchInterval(
                    setInterval(() => {
                        //dispatch.wallet.reloadWalletInfos(wallet.address);
                    }, 30000),
                );
            }
        }

        if (visibilityState === 'hidden') {
            if (balanceFetchInterval) {
                clearInterval(balanceFetchInterval);
            }
        }
    }, [visibilityState]);

    useEffect(() => {
        const keplrKeystoreChangeHandler = () => {
            console.log('keystore handler');
            if (wallet) {
                ToastUtils.showInfoToast({ content: I18n.t('keplrKeystoreChange') });
                dispatch({ type: 'LOGOUT' });
                dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: false }).finally(() => null);
                dispatch.wallet.connectOtherWallets(null);
            }
        };

        window.addEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);

        if (wallet && !balanceFetchInterval) {
            setBalanceFetchInterval(
                setInterval(() => {
                    //dispatch.wallet.reloadWalletInfos(wallet.address);
                }, 30000),
            );
        }

        if (!wallet && balanceFetchInterval) {
            clearInterval(balanceFetchInterval);
        }

        return () => {
            window.removeEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);
        };
    }, [wallet]);

    return (
        <>
            <Header keplrModalRef={keplrModalRef} logoutModalRef={logoutModalRef} />
            <div className='main-layout'>
                <div className='custom-container container fill'>
                    <main className='h-100'>
                        {appLoading ? (
                            <div className='d-flex justify-content-center align-items-center h-75'>
                                <div className='spinner-border' style={{ width: '3rem', height: '3rem', color: '#5634DE' }} role='status'>
                                    <span className='visually-hidden'>Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <Outlet />
                        )}
                        <RouteListener location={location} />
                    </main>
                </div>
            </div>
            <Modal id='get-keplr-modal' ref={keplrModalRef} withCloseButton={false}>
                <img src={infoIcon} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('keplrDownloadModal.title')}</h3>
                <Card flat withoutPadding className='d-flex flex-column flex-sm-row align-items-center mb-4 p-4'>
                    <img src={keplrIcon} alt='Keplr icon' className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0' />
                    <div className='d-flex flex-column align-items-start text-start'>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('keplrDownloadModal.description'),
                            }}
                        />
                        <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} target='_blank' rel='noreferrer'>
                            {I18n.t('keplrDownloadModal.link')}
                        </a>
                    </div>
                </Card>
                <div className='d-flex flex-column flex-sm-row align-self-stretch justify-content-between'>
                    <Button
                        outline
                        className='w-100'
                        onClick={() => {
                            if (keplrModalRef.current) {
                                keplrModalRef.current.hide();
                            }
                        }}
                    >
                        {I18n.t('keplrDownloadModal.later')}
                    </Button>
                    <Button
                        className='w-100 ms-0 ms-sm-4 mt-4 mt-sm-0'
                        onClick={() => {
                            window.open(NavigationConstants.KEPLR_EXTENSION_URL, '_blank');
                            if (keplrModalRef.current) {
                                keplrModalRef.current.hide();
                            }
                        }}
                    >
                        {I18n.t('keplrDownloadModal.download')}
                    </Button>
                </div>
            </Modal>
            <Modal id='logout-modal' ref={logoutModalRef}>
                <img src={infoIcon} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('logoutModal.title')}</h3>
                <div className='d-flex flex-row align-self-stretch justify-content-between'>
                    <Button
                        outline
                        className='w-100'
                        onClick={() => {
                            if (logoutModalRef.current) {
                                logoutModalRef.current.hide();
                            }
                        }}
                    >
                        {I18n.t('common.cancel')}
                    </Button>
                    <Button
                        className='w-100 ms-4'
                        onClick={() => {
                            if (logoutModalRef.current) {
                                logoutModalRef.current.hide();
                            }
                            setEnableAutoConnect(false);
                            store.dispatch({ type: LOGOUT });
                        }}
                    >
                        {I18n.t('logoutModal.logoutBtn')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default MainLayout;
