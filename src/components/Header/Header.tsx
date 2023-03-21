import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { gsap } from 'gsap';

import logo from 'assets/lotties/logo.json';
import { Button, Lottie } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { I18n, KeplrUtils, StringsUtils } from 'utils';
import { Dispatch, RootState } from 'redux/store';
import { NavigationConstants, PoolsConstants } from 'constant';

import Assets from 'assets';

import './Header.scss';

const Header = ({ keplrModalRef, logoutModalRef }: { keplrModalRef: RefObject<ModalHandlers>; logoutModalRef: RefObject<ModalHandlers> }) => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
    const timeline = useRef<gsap.core.Timeline>();
    const dispatch = useDispatch<Dispatch>();
    const [isLanding, setIsLanding] = useState(false);

    const location = useLocation();

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

    const connectWallet = async () => {
        if (KeplrUtils.isKeplrInstalled()) {
            await dispatch.wallet.enableKeplrAndConnectLumWallet({ silent: false, chainIds: Object.values(PoolsConstants.POOLS).map((pool) => pool.chainId) }).finally(() => null);
            await dispatch.wallet.connectOtherWallets();
        } else {
            if (keplrModalRef.current) {
                keplrModalRef.current.toggle();
            }
        }
    };

    const renderContent = () => {
        if (isLanding) {
            return (
                <ul className='nav d-flex align-items-center'>
                    <li className='d-none d-lg-block'>
                        <a href='#howItWorks' className='navlink opacity-100'>
                            {I18n.t('landing.howItWorks')}
                        </a>
                    </li>
                    <li className='mx-3 mx-lg-4 d-none d-md-block'>
                        <a href={NavigationConstants.DOCUMENTATION} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            {I18n.t('landing.documentation')}
                        </a>
                    </li>
                    <li className='d-none d-md-block'>
                        <a href={NavigationConstants.FAQ} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            {I18n.t('landing.faq')}
                        </a>
                    </li>
                    <li className='mx-3 mx-lg-4 d-none d-sm-block'>
                        <a href={NavigationConstants.TWITTER} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            <img className='scale-hover' src={Assets.images.twitterButton} alt='Twitter' />
                        </a>
                    </li>
                    <li className='d-none d-sm-block'>
                        <a href={NavigationConstants.DISCORD} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            <img className='scale-hover' src={Assets.images.discordButton} alt='Discord' />
                        </a>
                    </li>
                    <li className='ms-3 ms-lg-4'>
                        <Button to={NavigationConstants.HOME}>{I18n.t('landing.openTheApp')}</Button>
                    </li>
                </ul>
            );
        }

        return (
            <ul className='nav d-flex align-items-center'>
                <li>
                    <NavLink to={NavigationConstants.HOME} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('home.title')}
                    </NavLink>
                </li>
                <li className='mx-lg-5 mx-4'>
                    <NavLink to={NavigationConstants.POOLS} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('pools.title')}
                    </NavLink>
                </li>
                <li>
                    <NavLink to={NavigationConstants.MY_PLACE} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                        {I18n.t('myPlace.title')}
                    </NavLink>
                </li>
                <li className='ms-lg-5 ms-4'>
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

    return (
        <header className={`navbar fixed-top mt-4 mx-auto container p-4 ${!isLanding ? 'app' : ''}`}>
            <div className='background' />
            <nav className='container d-flex flex-row justify-content-center justify-content-sm-between align-items-center'>
                <Link to={NavigationConstants.LANDING}>
                    <Lottie
                        delay={1100}
                        className='logo'
                        animationData={logo}
                        segments={[
                            [0, 41],
                            [41, 257],
                        ]}
                    />
                </Link>
                <div className='navbar-items-container d-flex flex-row align-items-center'>{renderContent()}</div>
            </nav>
        </header>
    );
};

export default Header;
