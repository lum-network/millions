import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';
import Switch from 'react-switch';

import { slide as Menu } from 'react-burger-menu';

import logo from 'assets/lotties/logo.json';
import logoWhite from 'assets/lotties/logo_white.json';
import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';

import Assets from 'assets';
import { Button, Lottie } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { useColorScheme, useWindowSize } from 'hooks';
import { Firebase, I18n } from 'utils';
import { RootState } from 'redux/store';
import { Breakpoints, FirebaseConstants, NavigationConstants, PrizesConstants } from 'constant';

import ConnectButton from '../ConnectButton/ConnectButton';

import './Header.scss';

const Header = ({ logoutModalRef }: { logoutModalRef: RefObject<ModalHandlers> }) => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
    const prizes = useSelector((state: RootState) => state.wallet.lumWallet?.prizes);
    const timeline = useRef<gsap.core.Timeline>();
    const [isLanding, setIsLanding] = useState(false);
    const [isDrops, setIsDrops] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const headerRef = useRef(null);
    const location = useLocation();
    const winSizes = useWindowSize();
    const { isDark, setIsDark } = useColorScheme();

    useEffect(() => {
        setIsLanding(window.location.pathname === NavigationConstants.LANDING);

        setIsDrops(window.location.pathname.startsWith(NavigationConstants.DROPS));
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
            trigger: '#root',
            start: 'top top',
            end: 'top+=45px top',
            scrub: true,
        };

        if (!timeline.current) {
            timeline.current = gsap.timeline({
                scrollTrigger,
            });
        }

        timeline.current.to('header.navbar .background', {
            ease: 'none',
            opacity: 1,
        });
    }, [isDark]);

    const dismissMenuProps = {
        onClick: () => {
            setIsMenuOpen(false);
        },
    };

    const DarkModeSwitch = ({ inBurgerMenu = false }: { inBurgerMenu?: boolean }) => (
        <Switch
            checked={isDark}
            onChange={() => setIsDark(!isDark)}
            handleDiameter={35}
            offColor='#fff'
            onColor='#482673'
            offHandleColor='#5634DE'
            onHandleColor='#331954'
            height={inBurgerMenu ? 47 : 55}
            width={87}
            borderRadius={inBurgerMenu ? 9 : 12}
            uncheckedIcon={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <img src={Assets.images.moon} alt='moon' style={{ opacity: 0.2 }} />
                </div>
            }
            checkedIcon={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        paddingLeft: inBurgerMenu ? 0 : 6,
                    }}
                >
                    <img src={Assets.images.sun} alt='sun' style={{ opacity: 0.3 }} />
                </div>
            }
            uncheckedHandleIcon={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        fontSize: 20,
                    }}
                >
                    <img src={Assets.images.sun} alt='sun' />
                </div>
            }
            checkedHandleIcon={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                    }}
                >
                    <img src={Assets.images.moon} alt='moon' />
                </div>
            }
            className='dark-mode-switch ms-4'
        />
    );

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
                            forcePurple
                        >
                            {I18n.t('landing.openTheApp')}
                        </Button>
                    </li>
                    {!inBurgerMenu ? <DarkModeSwitch /> : null}
                </ul>
            );
        }

        if (isDrops) {
            return (
                <ul className='navbar-nav flex-row align-items-center ms-auto'>
                    <li className='nav-item' {...dismissMenuProps}>
                        <NavLink to={NavigationConstants.DROPS_POOLS} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                            {I18n.t('pools.title')}
                        </NavLink>
                    </li>
                    {address && (
                        <li className='nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0' {...dismissMenuProps}>
                            <NavLink to={NavigationConstants.DROPS_MY_DEPOSITS} className={({ isActive }) => `navlink position-relative ${isActive ? 'active' : ''}`}>
                                {I18n.t('depositDrops.myDeposits.title')}
                            </NavLink>
                        </li>
                    )}
                    {inBurgerMenu ? <Lottie className='cosmonaut-rocket' animationData={cosmonautWithRocket} /> : null}
                    <li className={`nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0 ${inBurgerMenu && 'mb-5'}`}>
                        <div className='d-flex flex-row align-items-center'>
                            <ConnectButton address={address} {...dismissMenuProps} />
                            {address ? (
                                <Button
                                    textOnly
                                    className='logout-btn ms-4'
                                    style={{ backgroundColor: isDark ? '#482673' : 'white' }}
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
                    {!inBurgerMenu ? <DarkModeSwitch /> : null}
                </ul>
            );
        }

        const prizesPendingLength = (prizes && prizes.filter((prize) => prize.state === PrizesConstants.PrizeState.PENDING).length) || 0;

        return (
            <ul className='d-flex flex-column flex-lg-row align-items-lg-center ms-auto'>
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
                            className={({ isActive }) => `navlink position-relative ${prizesPendingLength && 'me-4 me-xl-3'} ${isActive ? 'active' : ''}`}
                            onClick={() => Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.MY_SAVINGS_CLICK)}
                        >
                            {I18n.t('mySavings.title')}
                            {!!prizesPendingLength && (
                                <div
                                    className='prize-dot position-absolute top-0 start-100 rounded-circle d-flex align-items-center justify-content-center'
                                    style={{ transform: 'translate(20%, -50%)' }}
                                >
                                    {prizesPendingLength}
                                </div>
                            )}
                        </NavLink>
                    </li>
                )}
                {inBurgerMenu ? <Lottie className='cosmonaut-rocket' animationData={cosmonautWithRocket} /> : null}
                <li className={`nav-item ms-0 ms-lg-4 ms-xl-5 mt-4 mt-lg-0 ${inBurgerMenu && 'mb-5'}`}>
                    <div className='d-flex flex-row align-items-center'>
                        <ConnectButton address={address} {...dismissMenuProps} />
                        {address ? (
                            <Button
                                textOnly
                                className='logout-btn ms-4'
                                style={{ backgroundColor: isDark ? '#482673' : 'white' }}
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
                {!inBurgerMenu ? <DarkModeSwitch /> : null}
            </ul>
        );
    };

    const renderBurger = () => {
        return (
            <button
                className='navbar-toggler d-flex align-items-center justify-content-center ms-auto'
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
            <header ref={headerRef} className={`navbar fixed-top container mt-4 mx-auto px-4 py-2 py-lg-4 ${!isLanding ? 'app' : ''}`}>
                <div className='background' />
                <nav>
                    <Link to={NavigationConstants.LANDING}>
                        <Lottie
                            delay={1100}
                            className='logo'
                            animationData={isDark ? logoWhite : logo}
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
                    <div className='d-flex flex-row justify-content-between align-items-end menu-header pt-3'>
                        <Link to={NavigationConstants.LANDING} {...dismissMenuProps}>
                            <Lottie
                                delay={1100}
                                className='logo'
                                animationData={isDark ? logoWhite : logo}
                                segments={[
                                    [0, 41],
                                    [41, 400],
                                ]}
                            />
                        </Link>
                        <div className='d-flex flex-row align-items-center'>
                            <DarkModeSwitch inBurgerMenu />
                            <button
                                className='close-btn d-flex align-items-center justify-content-center ms-3'
                                style={{ backgroundColor: isDark ? '#482673' : '#5634de' }}
                                type='button'
                                aria-label='Close burger menu'
                                {...dismissMenuProps}
                            >
                                <span className={`btn-close ${isDark ? 'btn-close-white' : ''}`}></span>
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
