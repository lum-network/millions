import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import infoIcon from 'assets/images/info.svg';
import keplrIcon from 'assets/images/keplr.svg';
import { Button, Card, Header, Modal } from 'components';
import { NavigationConstants } from 'constant';
import { RouteListener } from 'navigation';
import { I18n } from 'utils';

import './MainLayout.scss';

const MainLayout = () => {
    const location = useLocation();

    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    return (
        <>
            <div className='main-layout'>
                <div className='container fill'>
                    <Header keplrModalRef={modalRef} />
                    <main className='h-100'>
                        <Outlet />
                        <RouteListener location={location} />
                    </main>
                </div>
            </div>
            <Modal id='get-keplr-modal' ref={modalRef} withCloseButton={false}>
                <img src={infoIcon} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('keplrDownloadModal.title')}</h3>
                <Card flat withoutPadding className='d-flex flex-row align-items-center mb-4 p-4'>
                    <img src={keplrIcon} alt='Keplr icon' className='keplr-icon me-4' />
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
                <div className='d-flex flex-row align-self-stretch justify-content-between'>
                    <Button
                        outline
                        className='w-100'
                        onClick={() => {
                            if (modalRef.current) {
                                modalRef.current.hide();
                            }
                        }}
                    >
                        {I18n.t('keplrDownloadModal.later')}
                    </Button>
                    <Button
                        className='w-100 ms-4'
                        onClick={() => {
                            window.open(NavigationConstants.KEPLR_EXTENSION_URL, '_blank');
                            if (modalRef.current) {
                                modalRef.current.hide();
                            }
                        }}
                    >
                        {I18n.t('keplrDownloadModal.download')}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default MainLayout;
