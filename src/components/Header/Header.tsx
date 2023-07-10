import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { slide as Menu } from 'react-burger-menu';

import logo from 'assets/lotties/logo.json';
import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';

import Assets from 'assets';
import { Button, Lottie } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { useWindowSize } from 'hooks';
import { Firebase, I18n, KeplrUtils, StringsUtils, ToastUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { Breakpoints, FirebaseConstants, NavigationConstants } from 'constant';

import './Header.scss';

const Header = ({ keplrModalRef, logoutModalRef }: { keplrModalRef: RefObject<ModalHandlers>; logoutModalRef: RefObject<ModalHandlers> }) => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
    const prizes = useSelector((state: RootState) => state.wallet.lumWallet?.prizes);
    const timeline = useRef<gsap.core.Timeline>();
    const dispatch = useDispatch<Dispatch>();
    const [isLanding, setIsLanding] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const location = useLocation();
    const winSizes = useWindowSize();

    useEffect(() => {
        setIsLanding(window.location.pathname === NavigationConstants.LANDING);
    }, [location.pathname]);

    useEffect(() => {
        // Enables Header GSAP animation only on the landing page
        if (location.pathname === NavigationConstants.LANDING) {
            gsap.fromTo(
                `header`,
                {
                    opacity: 0,
                    y: -50,
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.35,
                    delay: 1,
                },
            );
        } else {
            gsap.set('header', {
                opacity: 1,
            });
        }
    }, []);

    useEffect(() => {
        const scrollTrigger = {
            start: 'top top',
            end: '3% top',
            scrub: true,
        };

        if (!timeline.current) {
            const tl = gsap.timeline();

            timeline.current = tl;

            tl.to('header.navbar .background', {
                opacity: 1,
                ease: 'none',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'saturate(180%) blur(20px)',
                scrollTrigger: scrollTrigger,
            });
        }
    }, []);

    const dismissMenuProps = {
        onClick: () => {
            setIsMenuOpen(false);
        },
    };

    const connectWallet = async () => {
        if (KeplrUtils.isKeplrInstalled()) {
            await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: false }).finally(() => null);
            await dispatch.wallet.connectOtherWallets(null);
        } else {
            if (keplrModalRef.current) {
                keplrModalRef.current.toggle();
            }
        }
    };

    const copyAddress = () => {
        if (address) {
            Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.ADDRESS_COPIED);

            navigator.clipboard.writeText(address).then(
                () => {
                    ToastUtils.showSuccessToast({ content: I18n.t('common.copiedAddress') });
                },
                () => {
                    ToastUtils.showErrorToast({ content: I18n.t('errors.copyAddress') });
                },
            );
        }
    };

    const renderContent = (inBurgerMenu: boolean) => {
        if (isLanding) {
            return (
                <ul className='navbar-nav flex-row align-items-center ms-auto'>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a href='#howItWorks' className='navlink opacity-100'>
                            {I18n.t('landing.howItWorks')}
                        </a>
                    </li>
                    <li className='nav-item mx-0 mx-lg-3 mx-lg-4 my-3 my-lg-0' {...dismissMenuProps}>
                        <a
                            href={NavigationConstants.DOCUMENTATION}
                            target='_blank'
                            rel='noreferrer'
                            className='navlink opacity-100'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DOCUMENTATION_CLICK)}
                        >
                            {I18n.t('landing.documentation')}
                        </a>
                    </li>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a href={NavigationConstants.FAQ} className='navlink opacity-100'>
                            {I18n.t('landing.faq')}
                        </a>
                    </li>
                    <li className='nav-item mx-0 mx-lg-3 mx-lg-4 my-3 my-lg-0' {...dismissMenuProps}>
                        <a
                            href={NavigationConstants.TWITTER}
                            target='_blank'
                            rel='noreferrer'
                            className='navlink opacity-100'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.TWITTER_CLICK)}
                        >
                            <img className='scale-hover' src={Assets.images.twitterButton} alt='Twitter' />
                        </a>
                    </li>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a
                            href={NavigationConstants.DISCORD}
                            target='_blank'
                            rel='noreferrer'
                            className='navlink opacity-100'
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DISCORD_CLICK)}
                        >
                            <img className='scale-hover' src={Assets.images.discordButton} alt='Discord' />
                        </a>
                    </li>
                    <li className='nav-item ms-0 ms-lg-3 ms-lg-4 mt-3 mt-lg-0'>
                        <Button
                            to={NavigationConstants.HOME}
                            {...dismissMenuProps}
                            locationState={{ autoConnect: true }}
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.OPEN_APP_CLICK)}
                        >
                            {I18n.t('landing.openTheApp')}
                        </Button>
                    </li>
                </ul>
            );
        }

        return (
            <ul className='navbar-nav flex-row align-items-center ms-auto'>
                <li className='nav-item' {...dismissMenuProps}>
                    <NavLink
                        to={NavigationConstants.HOME}
                        className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
                        onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DASHBOARD_CLICK)}
                    >
                        {I18n.t('home.title')}
                    </NavLink>
                </li>
                <li className='nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0' {...dismissMenuProps}>
                    <NavLink
                        to={NavigationConstants.POOLS}
                        className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}
                        onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.POOLS_CLICK)}
                    >
                        {I18n.t('pools.title')}
                    </NavLink>
                </li>
                {address && (
                    <li className='nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0' {...dismissMenuProps}>
                        <NavLink
                            to={NavigationConstants.MY_SAVINGS}
                            className={({ isActive }) => `navlink position-relative ${isActive ? 'active' : ''}`}
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.MY_SAVINGS_CLICK)}
                        >
                            {I18n.t('mySavings.title')}
                            {prizes && prizes.length > 3 && (
                                <div className='position-absolute top-0 start-100 rounded-circle' style={{ width: 15, height: 15, backgroundColor: '#FA7676', transform: 'translate(-50%, -40%)' }} />
                            )}
                        </NavLink>
                    </li>
                )}
                {inBurgerMenu ? <Lottie className='cosmonaut-rocket' animationData={cosmonautWithRocket} /> : null}
                <li className='nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0' {...dismissMenuProps}>
                    <div className='d-flex flex-row'>
                        <Button outline className='flex-grow-1' onClick={!address ? connectWallet : copyAddress}>
                            {address ? StringsUtils.trunc(address) : I18n.t('connectWallet')}
                        </Button>
                        {address && !inBurgerMenu ? (
                            <Button
                                textOnly
                                className='ms-4'
                                onClick={() => {
                                    Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LOGOUT_CLICK);
                                    if (logoutModalRef.current) {
                                        logoutModalRef.current.show();
                                    }
                                }}
                            >
                                <img src={Assets.images.logout} />
                            </Button>
                        ) : null}
                    </div>
                </li>
            </ul>
        );
    };

    const renderBurger = () => {
        return (
            <button
                className='navbar-toggler d-flex align-items-center justify-content-center'
                type='button'
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-controls='offcanvasNavbar'
                aria-label='Toggle navigation'
            >
                <span className='navbar-toggler-icon'></span>
            </button>
        );
    };

    return (
        <>
            <header className={`navbar fixed-top container mt-4 mx-auto px-4 py-2 py-lg-4 ${!isLanding ? 'app' : ''}`}>
                <div className='background' />
                <nav>
                    <Link to={NavigationConstants.LANDING}>
                        <Lottie
                            delay={1100}
                            className='logo'
                            animationData={logo}
                            segments={[
                                [0, 41],
                                [41, 400],
                            ]}
                        />
                    </Link>
                    <div className='d-flex flex-row align-items-center'>{winSizes.width <= Breakpoints.LG ? renderBurger() : renderContent(false)}</div>
                </nav>
            </header>
            {winSizes.width <= Breakpoints.LG && (
                <Menu
                    right
                    customBurgerIcon={false}
                    customCrossIcon={false}
                    width={winSizes.width < Breakpoints.SM ? winSizes.width : 390}
                    isOpen={isMenuOpen}
                    onStateChange={(state) => setIsMenuOpen(state.isOpen)}
                >
                    <div className='d-flex flex-row justify-content-between menu-header pt-3'>
                        <Link to={NavigationConstants.LANDING} {...dismissMenuProps}>
                            <Lottie
                                delay={1100}
                                className='logo'
                                animationData={logo}
                                segments={[
                                    [0, 41],
                                    [41, 400],
                                ]}
                            />
                        </Link>
                        <div className='d-flex flex-row align-items-center'>
                            {address ? (
                                <Button
                                    textOnly
                                    className='me-2 me-sm-3'
                                    onClick={() => {
                                        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.LOGOUT_CLICK);
                                        setIsMenuOpen(false);
                                        if (logoutModalRef.current) {
                                            logoutModalRef.current.show();
                                        }
                                    }}
                                >
                                    <img src={Assets.images.logout} />
                                </Button>
                            ) : null}
                            <button className='close-btn d-flex align-items-center justify-content-center' type='button' aria-label='Close burger menu' {...dismissMenuProps}>
                                <span className='btn-close'></span>
                            </button>
                        </div>
                    </div>
                    {renderContent(true)}
                </Menu>
            )}
        </>
    );
};

export default Header;
