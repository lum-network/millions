import React, { RefObject, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import logo from 'assets/lotties/logo.json';
import { Button, Lottie } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { I18n } from 'utils';
import { NavigationConstants } from 'constant';
import { Tooltip } from 'react-tooltip';

import Assets from 'assets';

import './Header.scss';

const Header = ({}: { keplrModalRef: RefObject<ModalHandlers>; logoutModalRef: RefObject<ModalHandlers> }) => {
    const timeline = useRef<gsap.core.Timeline>();

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

    const onClickParticipate = () => {
        window.open('https://jpd0pqf6mcx.typeform.com/to/AimExuyx', '_blank')?.focus();
    };

    const renderContent = () => {
        return (
            <ul className='nav d-flex align-items-center'>
                <li className='d-none d-lg-block'>
                    <a href='#howItWorks' className='navlink opacity-100'>
                        {I18n.t('landing.howItWorks')}
                    </a>
                </li>
                <li className='mx-3 mx-lg-4 d-none d-md-block'>
                    <span data-tooltip-id='average-prize-tooltip' data-tooltip-html='Coming soon' className='ms-2'>
                        <a className='navlink' style={{ cursor: 'pointer', opacity: 0.5 }}>
                            {I18n.t('landing.documentation')}
                        </a>
                        <Tooltip id='average-prize-tooltip' className='tooltip-light width-400' variant='light' />
                    </span>
                </li>
                <li className='d-none d-md-block'>
                    <a href='#faq' className='navlink opacity-100'>
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
                <li className='ms-3 ms-lg-4 d-none d-sm-block'>
                    <Button onClick={onClickParticipate}>Participate now</Button>
                </li>
            </ul>
        );
    };

    return (
        <header className={`navbar fixed-top mt-4 mx-auto container p-4`}>
            <div className='background' />
            <nav className='container d-flex flex-row justify-content-center justify-content-sm-between align-items-center'>
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
                <div className='navbar-items-container d-flex flex-row align-items-center'>{renderContent()}</div>
            </nav>
        </header>
    );
};

export default Header;
