import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';

import logo from 'assets/images/logo.svg';
import { Button } from 'components';
import { I18n, StringsUtils } from 'utils';
import { RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

import twitterButton from 'assets/images/twitter_button.svg';
import discordButton from 'assets/images/discord_button.svg';

import './Header.scss';

const Header = () => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
    const timeline = useRef<gsap.core.Timeline>();
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
                            <img src={twitterButton} alt='Twitter' />
                        </a>
                    </li>
                    <li className='d-none d-sm-block'>
                        <a href={NavigationConstants.DISCORD} target='_blank' rel='noreferrer' className='navlink opacity-100'>
                            <img src={discordButton} alt='Discord' />
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
                    <Button outline>{address ? StringsUtils.trunc(address) : I18n.t('connectWallet')}</Button>
                </li>
            </ul>
        );
    };

    return (
        <header className={`navbar fixed-top mt-4 mx-auto container p-4 ${!isLanding ? 'app' : ''}`}>
            <div className='background' />
            <nav className='container d-flex flex-row justify-content-center justify-content-sm-between align-items-center'>
                <Link to='/'>
                    <img className='logo' src={logo} alt='Cosmos Millions logo' />
                </Link>
                <div className='navbar-items-container d-flex flex-row align-items-center'>{renderContent()}</div>
            </nav>
        </header>
    );
};

export default Header;
