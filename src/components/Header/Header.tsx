import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';
import { slide as Menu } from 'react-burger-menu';

import logo from 'assets/lotties/logo.json';
import { Button, Lottie } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { I18n, KeplrUtils, StringsUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

import Assets from 'assets';

import './Header.scss';
import { useWindowSize } from 'hooks';

const Header = ({ keplrModalRef, logoutModalRef }: { keplrModalRef: RefObject<ModalHandlers>; logoutModalRef: RefObject<ModalHandlers> }) => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
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
            end: '5% top',
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

    const renderContent = () => {
        if (isLanding) {
            return (
                <ul className='navbar-nav flex-row align-items-center ms-auto'>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a href='#howItWorks' className='navlink opacity-100'>
                            {I18n.t('landing.howItWorks')}
                        </a>
                    </li>
                    <li className='nav-item mx-0 mx-lg-3 mx-lg-4 my-3 my-lg-0' {...dismissMenuProps}>
                        <a href={NavigationConstants.DOCUMENTATION} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            {I18n.t('landing.documentation')}
                        </a>
                    </li>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a href={NavigationConstants.FAQ} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            {I18n.t('landing.faq')}
                        </a>
                    </li>
                    <li className='nav-item mx-0 mx-lg-3 mx-lg-4 my-3 my-lg-0' {...dismissMenuProps}>
                        <a href={NavigationConstants.TWITTER} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            <img className='scale-hover' src={Assets.images.twitterButton} alt='Twitter' />
                        </a>
                    </li>
                    <li className='nav-item' {...dismissMenuProps}>
                        <a href={NavigationConstants.DISCORD} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            <img className='scale-hover' src={Assets.images.discordButton} alt='Discord' />
                        </a>
                    </li>
                    <li className='nav-item ms-0 ms-lg-3 ms-lg-4 mt-3 mt-lg-0' {...dismissMenuProps}>
                        <Button to={NavigationConstants.HOME} locationState={{ autoConnect: true }}>
                            {I18n.t('landing.openTheApp')}
                        </Button>
                    </li>
                </ul>
            );
        }

        return (
            <ul className='navbar-nav flex-row align-items-center ms-auto'>
                <li className='nav-item' {...dismissMenuProps}>
                    <NavLink to={NavigationConstants.HOME} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('home.title')}
                    </NavLink>
                </li>
                <li className='nav-item mx-lg-5 mx-0 mx-lg-4 mt-3 mt-lg-0' {...dismissMenuProps}>
                    <NavLink to={NavigationConstants.POOLS} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('pools.title')}
                    </NavLink>
                </li>
                <li className='nav-item mt-3 mt-lg-0' {...dismissMenuProps}>
                    <NavLink to={NavigationConstants.MY_SAVINGS} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('mySavings.title')}
                    </NavLink>
                </li>
                <li className='nav-item ms-lg-5 ms-0 ms-lg-4 mt-3 mt-lg-0' {...dismissMenuProps}>
                    <Button
                        outline
                        onClick={
                            !address
                                ? connectWallet
                                : () => {
                                      if (logoutModalRef.current) {
                                          logoutModalRef.current.toggle();
                                      }
                                  }
                        }
                    >
                        {address ? StringsUtils.trunc(address) : I18n.t('connectWallet')}
                    </Button>
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
                    <div className='d-flex flex-row align-items-center'>{winSizes.width <= 992 ? renderBurger() : renderContent()}</div>
                </nav>
            </header>
            {winSizes.width <= 992 && (
                <Menu right customBurgerIcon={false} customCrossIcon={false} isOpen={isMenuOpen} onStateChange={(state) => setIsMenuOpen(state.isOpen)}>
                    <div className='d-flex flex-row justify-content-between mb-4'>
                        <h3 className='offcanvas-title' id='offcanvasNavbarLabel'>
                            Cosmos Millions
                        </h3>
                        <button type='button' className='btn-close' aria-label='Close' {...dismissMenuProps}></button>
                    </div>
                    {renderContent()}
                </Menu>
            )}
        </>
    );
};

export default Header;
