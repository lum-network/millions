import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { gsap } from 'gsap';

import logo from 'assets/images/logo.svg';
import { Button } from 'components';
import { I18n, StringsUtils } from 'utils';
import { RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

import './Header.scss';

const Header = () => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);
    const timeline = useRef<gsap.core.Timeline>();

    useEffect(() => {
        // Enables Header GSAP animation only on the landing page
        if (window.location.pathname === '/') {
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

    return (
        <header className='navbar fixed-top mt-4 mx-auto container p-4'>
            <div className='background' />
            <nav className='container d-flex flex-row justify-content-center justify-content-md-between align-items-center'>
                <Link to='/'>
                    <img src={logo} alt='Cosmos Millions logo' />
                </Link>
                <div className='navbar-items-container d-none d-md-flex flex-row align-items-center'>
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
                </div>
            </nav>
        </header>
    );
};

export default Header;
