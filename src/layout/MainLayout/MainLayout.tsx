import React, { useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { useDispatch, useSelector, useStore } from 'react-redux';

import Assets from 'assets';
import { Button, Card, Header, Modal } from 'components';
import { NavigationConstants, TERMS_VERSION, WalletProvider, FirebaseConstants } from 'constant';
import { useVisibilityState } from 'hooks';
import { Dispatch, RootState } from 'redux/store';
import { LOGOUT } from 'redux/constants';
import { RouteListener } from 'navigation';
import { I18n, WalletProvidersUtils, ToastUtils, StorageUtils, Firebase } from 'utils';

import './MainLayout.scss';

const MainLayout = () => {
    const [enableAutoConnect, setEnableAutoConnect] = useState(true);
    const [termsChecked, setTermsChecked] = useState(false);

    const location = useLocation();

    const [approvedTermsVersion, setApprovedTermsVersion] = useState(localStorage.getItem('@approvedTermsVersion'));

    const logoutModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const termsModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const wallet = useSelector((state: RootState) => state.wallet.lumWallet);
    const appInitialized = useSelector((state: RootState) => state.app);

    const dispatch = useDispatch<Dispatch>();
    const store = useStore();
    const visibilityState = useVisibilityState();

    useEffect(() => {
        const autoConnect = async (provider: WalletProvider) => {
            await dispatch.wallet.connectWallet({ provider, silent: enableAutoConnect }).finally(() => null);
            await dispatch.wallet.connectOtherWallets(provider);
        };

        const autoconnectProvider = StorageUtils.getAutoconnectProvider();

        if (
            !wallet &&
            appInitialized &&
            WalletProvidersUtils.isAnyWalletInstalled() &&
            location.pathname !== NavigationConstants.LANDING &&
            enableAutoConnect &&
            approvedTermsVersion &&
            TERMS_VERSION >= Number(approvedTermsVersion) &&
            autoconnectProvider
        ) {
            autoConnect(autoconnectProvider).finally(() => null);
        }
    }, [wallet, location, enableAutoConnect, approvedTermsVersion, appInitialized]);

    useEffect(() => {
        if (location.pathname !== NavigationConstants.LANDING && (!approvedTermsVersion || Number(approvedTermsVersion) < TERMS_VERSION)) {
            if (termsModalRef.current) {
                Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TERMS_VIEW, { version: TERMS_VERSION });
                termsModalRef.current.show();
            }

            return;
        }

        if (location.pathname === NavigationConstants.LANDING) {
            setEnableAutoConnect(false);
        }

        if (location.state?.autoConnect) {
            setEnableAutoConnect(true);
        }
    }, [location]);

    useEffect(() => {
        if (visibilityState === 'visible') {
            if (wallet && (location.pathname === NavigationConstants.HOME || location.pathname === NavigationConstants.POOLS || location.pathname === NavigationConstants.MY_SAVINGS)) {
                dispatch.wallet.reloadWalletInfos({ address: wallet.address, force: false });
            }
        }
    }, [visibilityState, location.pathname]);

    useEffect(() => {
        const keystoreChangeHandler = (provider: WalletProvider) => {
            if (wallet && provider === StorageUtils.getAutoconnectProvider()) {
                ToastUtils.showInfoToast({
                    content: I18n.t(provider === WalletProvider.Cosmostation ? 'cosmostationKeystoreChange' : provider === WalletProvider.Leap ? 'leapKeystoreChange' : 'keplrKeystoreChange'),
                });
                dispatch.wallet.connectWallet({ provider, silent: true }).finally(() => null);
                dispatch.wallet.connectOtherWallets(provider);
            }
        };

        const keplrKeystoreChangeHandler = () => keystoreChangeHandler(WalletProvider.Keplr);
        const leapKeystoreChangeHandler = () => keystoreChangeHandler(WalletProvider.Leap);
        const cosmostationKeystoreChangeHandler = () => keystoreChangeHandler(WalletProvider.Cosmostation);

        window.addEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);
        window.addEventListener('leap_keystorechange', leapKeystoreChangeHandler, false);
        window.addEventListener('cosmostation_keystorechange', cosmostationKeystoreChangeHandler, false);

        return () => {
            window.removeEventListener('keplr_keystorechange', keplrKeystoreChangeHandler, false);
            window.removeEventListener('leap_keystorechange', leapKeystoreChangeHandler, false);
            window.removeEventListener('cosmostation_keystorechange', cosmostationKeystoreChangeHandler, false);
        };
    }, [wallet]);

    const removeBackdrop = () => {
        const backdrops = document.querySelectorAll('.modal-backdrop');

        backdrops.forEach((backdrop) => backdrop.remove());
    };

    return (
        <div className='main-layout'>
            <Header logoutModalRef={logoutModalRef} />
            <main className='custom-container container'>
                {!appInitialized ? (
                    <div className='d-flex justify-content-center align-items-center h-75'>
                        <div className='spinner-border' role='status'>
                            <span className='visually-hidden'>{I18n.t('common.loading')}</span>
                        </div>
                    </div>
                ) : (
                    <Outlet />
                )}
                <RouteListener location={location} />
                <ScrollRestoration />
            </main>
            <Modal id='get-keplr-modal' withCloseButton={false}>
                <img src={Assets.images.info} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('keplrDownloadModal.title')}</h3>
                {!isMobile ? (
                    <Card
                        flat
                        withoutPadding
                        className='d-flex flex-column flex-sm-row align-items-center mt-4 p-4'
                        onClick={() => {
                            window.open(NavigationConstants.KEPLR_EXTENSION_URL, '_blank');
                        }}
                        data-bs-dismiss='modal'
                    >
                        <img src={Assets.images.keplr} alt='Keplr icon' className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0 no-filter' />
                        <div className='d-flex flex-column align-items-start text-start'>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: I18n.t('keplrDownloadModal.keplr.description'),
                                }}
                            />
                            <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} onClick={(e) => e.stopPropagation()} target='_blank' rel='noreferrer'>
                                {I18n.t('keplrDownloadModal.link')}
                            </a>
                        </div>
                    </Card>
                ) : null}
                <Card
                    flat
                    withoutPadding
                    className='d-flex flex-column flex-sm-row align-items-center my-4 p-4'
                    onClick={() => {
                        window.open(isMobile ? NavigationConstants.LEAP_DEEPLINK : NavigationConstants.LEAP_EXTENSION_URL, '_blank');
                    }}
                    data-bs-dismiss='modal'
                >
                    <img src={Assets.images.leap} alt='Leap icon' className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0 no-filter' />
                    <div className='d-flex flex-column align-items-start text-start'>
                        <p
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('keplrDownloadModal.leap.description'),
                            }}
                        />
                        <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} onClick={(e) => e.stopPropagation()} target='_blank' rel='noreferrer'>
                            {I18n.t('keplrDownloadModal.link')}
                        </a>
                    </div>
                </Card>
            </Modal>
            <Modal id='choose-wallet-modal' withCloseButton={false}>
                <img src={Assets.images.info} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('keplrDownloadModal.title')}</h3>
                {!isMobile ? (
                    <Card
                        flat
                        withoutPadding
                        className='d-flex flex-column flex-sm-row align-items-center p-4 mt-4'
                        onClick={() => {
                            WalletProvidersUtils.isKeplrInstalled() ? dispatch.wallet.connect(WalletProvider.Keplr) : window.open(NavigationConstants.KEPLR_EXTENSION_URL, '_blank');
                        }}
                        data-bs-dismiss='modal'
                    >
                        <img src={Assets.images.keplr} alt='Keplr icon' className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0 no-filter' />
                        <div className='d-flex flex-column align-items-start text-start'>
                            <h2
                                dangerouslySetInnerHTML={{
                                    __html: I18n.t('chooseWalletModal.keplr'),
                                }}
                            />
                            <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} onClick={(e) => e.stopPropagation()} target='_blank' rel='noreferrer'>
                                {I18n.t('keplrDownloadModal.link')}
                            </a>
                        </div>
                    </Card>
                ) : null}
                <Card
                    flat
                    withoutPadding
                    className='d-flex flex-column flex-sm-row align-items-center p-4 my-4'
                    onClick={() => {
                        WalletProvidersUtils.isKeplrInstalled() ? dispatch.wallet.connect(WalletProvider.Leap) : window.open(NavigationConstants.LEAP_EXTENSION_URL, '_blank');
                    }}
                    data-bs-dismiss='modal'
                >
                    <img src={Assets.images.leap} alt='Leap icon' className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0 no-filter' />
                    <div className='d-flex flex-column align-items-start text-start'>
                        <h2
                            dangerouslySetInnerHTML={{
                                __html: I18n.t('chooseWalletModal.leap'),
                            }}
                        />
                        <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} onClick={(e) => e.stopPropagation()} target='_blank' rel='noreferrer'>
                            {I18n.t('keplrDownloadModal.link')}
                        </a>
                    </div>
                </Card>
                {!isMobile ? (
                    <Card
                        flat
                        withoutPadding
                        className='d-flex flex-column flex-sm-row align-items-center mb-4 p-4'
                        onClick={() => {
                            WalletProvidersUtils.isCosmostationInstalled()
                                ? dispatch.wallet.connect(WalletProvider.Cosmostation)
                                : window.open(NavigationConstants.COSMOSTATION_EXTENSION_URL, '_blank');
                        }}
                        data-bs-dismiss='modal'
                    >
                        <img
                            src={Assets.images.cosmostation}
                            alt='Cosmostation icon'
                            className='keplr-icon me-0 me-sm-4 mb-4 mb-sm-0 no-filter'
                            style={{ padding: 16, backgroundColor: 'black', borderRadius: 18 }}
                        />
                        <div className='d-flex flex-column align-items-start text-start'>
                            <h2
                                dangerouslySetInnerHTML={{
                                    __html: I18n.t('chooseWalletModal.cosmostation'),
                                }}
                            />
                            <a href={NavigationConstants.INTERCHAIN_WALLETS_DOC} onClick={(e) => e.stopPropagation()} target='_blank' rel='noreferrer'>
                                {I18n.t('keplrDownloadModal.link')}
                            </a>
                        </div>
                    </Card>
                ) : null}
            </Modal>
            <Modal id='logout-modal' ref={logoutModalRef}>
                <img src={Assets.images.info} alt='info' width={42} height={42} />
                <h3 className='my-4'>{I18n.t('logoutModal.title')}</h3>
                <div className='d-flex flex-row align-self-stretch justify-content-between'>
                    <Button
                        outline
                        className='w-100'
                        onClick={() => {
                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LOGOUT_CANCELLED);

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
                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LOGOUT_CONFIRMED);

                            if (logoutModalRef.current) {
                                logoutModalRef.current.hide();
                            }

                            Firebase.signOut().finally(() => null);

                            setEnableAutoConnect(false);
                            store.dispatch({ type: LOGOUT });
                        }}
                        forcePurple
                    >
                        {I18n.t('logoutModal.logoutBtn')}
                    </Button>
                </div>
            </Modal>
            <Modal id='terms-modal' ref={termsModalRef} dataBsBackdrop='static' withCloseButton={false} modalWidth={1000}>
                <h2>{I18n.t('termsModal.title')}</h2>
                <p className='terms-modal-desc'>{I18n.t('termsModal.description')}</p>
                <div className='terms-modal-content'>
                    <h4>Last updated: June 2023</h4>
                    <h5>PREAMBLE</h5>
                    <p>
                        These Cosmos Millions Interface Terms of Use (“<strong>Terms</strong>”), together with any documents incorporated by reference herein, govern your access to and use of this
                        user interface, including all related tools and application programming interfaces (APIs) that are made available thereon (“<strong>Cosmos Millions Interface</strong>”). By
                        visiting or using the the Cosmos Millions Interface, you signify your consent to these Terms.
                    </p>
                    <p>
                        The operator of the Cosmos Millions Interface (“<strong>Interface Operator</strong>”) reserves the right to modify these Terms at any time at its sole discretion. In this case,
                        the Interface Operator will provide notice by changing the “last updated” date above. By continuing to access or use the Cosmos Millions Interface, you confirm that you accept
                        these updated Terms and all documents incorporated therein by reference. If you do not agree with these Terms, please immediately cease all use of the Cosmos Millions
                        Interface.
                    </p>
                    <h5>1. Eligibility and Prohibited Jurisdictions</h5>
                    <p>By accessing or using the Cosmos Millions Interface, you represent and warrant that you:</p>
                    <ol type='a'>
                        <li>have the right, authority, and legal capacity to accept these Terms;</li>
                        <li>will not use the Cosmos Millions Interface if the laws of your countries of residency and/or citizenship prohibit you from doing so in accordance with these Terms;</li>
                        <li>are not subject to personal sanctions issued by the UN, US, or EU;</li>
                        <li>only access or use the Cosmos Millions Interface for your own personal use;</li>
                        <li>
                            are not accessing the Cosmos Millions Interface from one of the countries in the list hereafter, or a country embargoed or restricted by the European Union or the United
                            States of America, including, but not limited to: Belarus, Burundi, Central African Republic, Congo, North Korea, Guinea, Guinea-Bissau, Iran, Iraq, Lebanon, Libya, Mali,
                            Myanmar (Burma), Republic of South Sudan, Russia, Somalia, Sudan, Switzerland, Syria, Ukraine, Venezuela, Yemen, or Zimbabwe (“
                            <strong>Prohibited Jurisdictions</strong>”).
                        </li>
                    </ol>
                    <h5>2. Cosmos Millions</h5>
                    <h5>2.1 Overview</h5>
                    <p>
                        Cosmos Millions is a prize-linked savings account or premium bond product with a no-loss mechanism that was deployed on the Lum Network (“<strong>Cosmos Millions</strong>”).
                        Cosmos Millions consists of a variety of permissionless and non-custodial pools containing a single type of native token from the Cosmos ecosystem (“<strong>Pools</strong>”).
                        The tokens that are bonded into the Pools by the participating users are delegated to a validator of the respective blockchain based on the parameters of the Pool in order to
                        generate staking rewards. The staking rewards (minus fees) that are generated by the Pool are subsequently allocated to one or more participating users based on the Pool’s
                        algorithm.
                    </p>
                    <h5>2.2 Cosmos Millions is Not Operated by the Interface Operator</h5>
                    <p>
                        Cosmos Millions has been deployed by the validators of the Lum Network and is collectively governed by the holders of the LUM Token. The access to and use of Cosmos Millions is
                        made at your own risk. The Interface Operator is not responsible for the deployment of Cosmos Millions on the Lum Network and does not own, develop, maintain, operate, or
                        control the functionalities of Cosmos Millions or the individual Pools. The Interface Operator does therefore not assume any responsibility for Cosmos Millions and the
                        individual Pools.
                    </p>
                    <h5>3. Features of the Cosmos Millions Interface</h5>
                    <h5>3.1 Overview</h5>
                    <p>
                        The Cosmos Millions Interface serves as a graphical user interface that provides an easy way to access to and interact with Cosmos Millions and the individual Pools as
                        described herein. The Interface Operator reserves the right to add and remove Cosmos Millions Interface features or to discontinue the operation of the Cosmos Millions
                        Interface in its entirety at any time without prior notice. Since Cosmos Millions and the Pools can be accessed via other user interfaces or by interacting with the Lum Network
                        directly, their usability and accessibility is not dependent on Interface Operator or the availability of the Cosmos Millions Interface.
                    </p>
                    <h5>3.2 Display of Network Information</h5>
                    <p>
                        When you visit the Cosmos Millions Interface, the Cosmos Millions Interface will display publicly available information that is related to Cosmos Millions, such as the tokens
                        bonded into the individual Pools or the total value locked (“Network Information”). While some of the Network Information will be displayed by default, you can also use the
                        Cosmos Millions Interface to search for specific Network Information.
                        <br />
                        The Network Information is automatically sourced from the nodes of the Lum Network and other blockchains in the Cosmos ecosystem via application programming interfaces (APIs)
                        and displayed for informational purposes only. The Interface Operator does not assume any responsibility for the accuracy, completeness or actuality of the Network Information
                        and shall not be liable for any claims or damages related to errors, inaccuracies, or delays in the display of the Network Information or any decisions, transaction, acts or
                        omissions that you make in reliance thereon.
                    </p>
                    <h5>3.3 Connection of Wallets to the Cosmos Interface</h5>
                    <p>
                        To participate in Cosmos Millions and interact with the Pools, you must first connect one of the IBC-enabled third-party wallets listed under the “Connect” tab (“
                        <strong>Wallet</strong>”) to the Cosmos Millions Interface. Wallets store and manage the private keys to the blockchain addresses that were created with the Wallet or manually
                        imported into the Wallet. As these Wallets store the private keys which are required to sign transactions on-chain, they can be used to execute transactions and publish them to
                        the respective blockchain.
                        <br />
                        When you connect a Wallet, the Cosmos Millions Interface will ask for permission to send Sign Requests (as defined in Section 3.4 below) to the Wallet. During this process,
                        your Wallet will show the blockchain addresses managed by the Wallet that can be connected to the Cosmos Millions Interface. You can modify these permissions at any time in the
                        settings of the Wallet. Please note that you can only interact with blockchain addresses that are both managed by the Wallet and connected to the Cosmos Millions Interface.
                        <br />
                        The use of Wallets that are connected to the Cosmos Millions Interface is subject to the terms and conditions of the respective provider. The Interface Operator has no control
                        over the blockchain addresses that are managed by the Wallet and connected to the Cosmos Millions Interface and no ability to access any assets that are held thereon.
                        <br />
                        You are solely responsible for the security of the Wallet as well as the corresponding private keys and passwords. The Interface Operator does not assume any responsibility for
                        the connected Wallets, regardless of whether they are used to effectuate transactions, and shall not be liable for any damages arising out of or related to your use of the
                        Wallets or your inability to connect or use the Wallets to execute transactions.
                    </p>
                    <h5>3.4 Generation of Sign Requests</h5>
                    <p>
                        Once you have connected a Wallet to the Cosmos Millions Interface, you can use the Cosmos Millions Interface to initiate transactions from your blockchain address by generating
                        standardized transaction messages (“Sign Requests”). Sign Requests generated on the Cosmos Millions Interface are sent to the connected Wallet for approval.
                        <br />
                        To complete the transaction, you must sign the transaction with the Wallet. The Cosmos Millions Interface will then display whether the transaction was successful and inform
                        you once it is finalized.
                        <br />
                        Transactions that are signed with a Wallet are executed on the respective blockchain without any involvement of the Interface Operator. The Cosmos Millions Interface does not
                        execute transactions on your behalf and does not control the execution of transactions initiated by you. You are fully responsible for all inputs you make while using the
                        Cosmos Millions Interface.
                    </p>
                    <h5>3.5 Gas Fees</h5>
                    <p>
                        All transactions that are initiated on the Cosmos Millions Interface require the payment of a transaction fee (“<strong>Gas Fee</strong>”). The Gas Fee is added to the
                        transaction amount and paid to the validators of the blockchain on which the respective transaction is executed. By using the Cosmos Millions Interface to initiate
                        transactions, you acknowledge that the Gas Fee is completely outside of the control of the Interface Operator and agree that the Gas Fees paid to the respective network
                        validators are non-refundable under any circumstances.
                    </p>
                    <h5>4. Limited Warranty</h5>
                    <p>
                        The Interface Operator does not guarantee that the Cosmos Millions Interface is free from defects, errors, bugs, and security vulnerabilities or that it will be available at
                        any time. The access to and use of the Cosmos Millions Interface is made at your own risk. You understand and agree that the Cosmos Millions Interface is provided on an “as is”
                        and “as available” basis and that the Interface Operator expressly disclaims warranties or conditions of any kind, either express or implied.
                    </p>
                    <h5>5. Limitation of Liability</h5>
                    <p>
                        The liability of the Interface Operator is limited to direct damages arising out of acts of intent and gross negligence. Any liability for indirect damages or consequential
                        damages, including loss of profit, and/or damages arising out of negligent conduct, is expressly excluded.
                    </p>
                    <h5>6. Miscellaneous</h5>
                    <h5>6.1 User Feedback</h5>
                    <p>
                        The Interface Operator appreciates and encourages you to provide feedback to the Cosmos Millions Interface. If you provide feedback, you agree that the Interface Operator is
                        free to use it and may permit others to use it without any restriction or compensation to you.
                    </p>
                    <h5>6.2 Tax Considerations</h5>
                    <p>
                        It is your sole responsibility to seek relevant tax advice to comply with any applicable tax obligations in whichever jurisdiction and to measure the tax impact of the use of
                        the Cosmos Millions Interface and the use of the features offered thereon.
                    </p>
                    <h5>6.3 Entire Agreement and Severability</h5>
                    <p>
                        These Terms contain the entire agreement between you and the Interface Operator regarding the subject matter hereof and supersedes all understandings and agreements whether
                        written or oral. If any provision of these Terms is invalid, illegal, or unenforceable in any jurisdiction, such invalidity, illegality, or unenforceability shall not affect
                        any other provision of these Terms or invalidate or render unenforceable such provision in any other jurisdiction. Upon such determination that any provision is invalid,
                        illegal, or unenforceable, these Terms shall be modified to effectuate the original intent of the parties as closely as possible.
                    </p>
                    <h5>7. Class Action Waiver</h5>
                    <p>
                        To the fullest extent permitted by applicable law, you waive the right to participate in a class action lawsuit or a class-wide arbitration against the Interface Operator, its
                        affiliates, or any other individual or entity involved in the operation of the Cosmos Millions Interface.
                    </p>
                </div>
                <div className='d-flex my-4 terms-checkbox'>
                    <input onChange={(value) => setTermsChecked(value.target.checked)} type='checkbox' className='me-3' /> {I18n.t('termsModal.checkbox')}
                </div>
                <div className='d-flex flex-row'>
                    <Button
                        disabled={!termsChecked}
                        data-bs-dismiss='modal'
                        onClick={() => {
                            if (termsModalRef.current) {
                                termsModalRef.current.hide();
                            }

                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TERMS_ACCEPTED, { version: TERMS_VERSION });

                            removeBackdrop();

                            localStorage.clear();
                            localStorage.setItem('@approvedTermsVersion', String(TERMS_VERSION));
                            setApprovedTermsVersion(String(TERMS_VERSION));

                            setEnableAutoConnect(true);
                        }}
                        forcePurple
                    >
                        {I18n.t('termsModal.cta')}
                    </Button>
                    <Button
                        outline
                        className='ms-4'
                        to={NavigationConstants.LANDING}
                        onClick={() => {
                            if (termsModalRef.current) {
                                termsModalRef.current.hide();
                            }

                            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TERMS_DECLINED, { version: TERMS_VERSION });

                            removeBackdrop();
                        }}
                    >
                        {I18n.t('termsModal.cancel')}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default MainLayout;
