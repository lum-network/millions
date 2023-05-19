import React, { useEffect, useRef } from 'react';

import { I18n } from 'utils';
import { Button, Card, Lottie, Collapsible, BestPrizeCard } from 'components';
import { LandingConstants, NavigationConstants } from 'constant';
import { gsap, Power1 } from 'gsap';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import cosmonautWithBalloons2 from 'assets/lotties/cosmonaut_with_balloons_2.json';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';
import cosmonautZen from 'assets/lotties/cosmonaut_zen.json';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import Assets from 'assets';

import './Landing.scss';
import PoolCard from './components/PoolCard';
import { useWindowSize } from 'hooks';

const Landing = () => {
    const onClickParticipate = () => {
        window.open('https://jpd0pqf6mcx.typeform.com/to/EWhmt9J6', '_blank')?.focus();
    };

    const onClickDiscord = () => {
        window.open(NavigationConstants.DISCORD, '_blank')?.focus();
    };

    const timeline = useRef<gsap.core.Timeline>();
    const { width } = useWindowSize();

    useEffect(() => {
        // GSAP Section Scroll Animations
        const scrollTriggerHowItWorks = {
            trigger: `#howItWorks`,
            start: 'top 60%',
            end: 'top 10%',
            scrub: true,
        };

        gsap.to(`#howItWorks h1`, {
            translateY: -30,
            ease: 'none',
            scrollTrigger: scrollTriggerHowItWorks,
        });
    }, []);

    useEffect(() => {
        // GSAP Section Show Animations
        if (!timeline.current) {
            const tl = gsap.timeline();
            timeline.current = tl;
            tl.fromTo(`#saving`, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.75 });
            if (width < LandingConstants.MAX_PHONE_DEVICE_WIDTH) {
                tl.fromTo(
                    `#saving .saving-title`,
                    {
                        opacity: 0,
                        y: 10,
                    },
                    {
                        duration: 0.5,
                        opacity: 1,
                        y: 0,
                    },
                    '=-1',
                );
            } else {
                const titleSplit = new SplitText(`#saving .saving-title`, { type: 'words,chars' });
                tl.fromTo(
                    titleSplit.chars,
                    {
                        opacity: 0,
                        color: '#FFFFFF',
                        textShadow: `0 0 10px #ffffff, 0 0 20px #ffffff, 0 0 30px #ffffff, 0 0 40px #ffffff, 0 0 50px #ffffff, 0 0 60px #ffffff, 0 0 70px #ffffff`,
                        ease: Power1.easeIn,
                    },
                    {
                        duration: 0.5,
                        opacity: 1,
                        color: '#5634DE',
                        // eslint-disable-next-line max-len
                        textShadow: `0 0 10px rgba(255,255,255,0), 0 0 20px rgba(255,255,255,0), 0 0 30px rgba(255,255,255,0), 0 0 40px rgba(255,255,255,0), 0 0 50px rgba(255,255,255,0), 0 0 60px rgba(255,255,255,0), 0 0 70px rgba(255,255,255,0)`,
                        ease: Power1.easeIn,
                        stagger: 0.075,
                    },
                    '=-1',
                );
            }

            tl.fromTo(
                `#saving .description`,
                {
                    opacity: 0,
                    y: 10,
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    y: 0,
                    stagger: 0.25,
                },
                '=-0.3',
            );
            tl.fromTo(
                `#saving .cta`,
                {
                    opacity: 0,
                    y: 10,
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    y: 0,
                    stagger: 0.25,
                },
                '=-0.4',
            );

            tl.fromTo(
                `#cosmos-game h2`,
                {
                    opacity: 0,
                    y: 10,
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    y: 0,
                    stagger: 0.3,
                },
                '=0.4',
            );
            tl.fromTo(
                `#cosmos-game .cosmos-game-description`,
                {
                    opacity: 0,
                    y: 10,
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    y: 0,
                    stagger: 0.3,
                },
                '=0.2',
            );
        }
    }, [width]);

    const faqQuestions = I18n.t('landing.faqSection.questions', { returnObjects: true });

    return (
        <div className='landing-container'>
            <div className='row g-5'>
                <div id='saving' className='saving col-12'>
                    <Card withoutPadding className='d-flex flex-column flex-lg-row'>
                        <div style={{ flex: 1 }} className='p-4 p-xxl-5'>
                            <h2 className='saving-title mb-4' dangerouslySetInnerHTML={{ __html: I18n.t('landing.saving.title') }} />
                            <div className='description'>
                                <p>{I18n.t('landing.saving.p1')}</p>
                                <p>{I18n.t('landing.saving.p2')}</p>
                            </div>
                            <Button className='cta' onClick={onClickParticipate}>
                                Stay tuned!
                            </Button>
                        </div>
                        <div style={{ flex: 2 }}>
                            <BestPrizeCard biggestPrize={{ amount: '5000', denom: 'lum' }} />
                        </div>
                    </Card>
                </div>
                <div className='position-relative cosmos-game-left col-12 col-lg-5'>
                    <Lottie
                        className='cosmos-with-balloons'
                        animationData={cosmonautWithBalloons2}
                        delay={2500}
                        segments={[
                            [0, 20],
                            [20, 167],
                        ]}
                    />
                </div>
                <div id='cosmos-game' className='cosmos-game-right col-12 col-lg-7'>
                    <Card>
                        <h2 className='mb-4 text-center'>
                            Time to Spice Up
                            <br />
                            the Cosmos Game!
                        </h2>
                        <div className='cosmos-game-description'>
                            <p className='text-center'>
                                That&apos;s one small step for Cosmonauts,
                                <br />
                                one giant leap for Cosmos.
                            </p>
                            <div className='d-flex flex-column'>
                                <Card withoutPadding flat className='p-3 mb-4'>
                                    <p className='text-flat-card'>
                                        Speed up your path to financial tranquility with our thrilling prize-linked savings accounts!
                                        <br />
                                        Save your assets in our protocol and random winners will receive prizes from the entire community at each draw.
                                    </p>
                                </Card>
                                <Card withoutPadding flat className='p-3'>
                                    <p className='text-flat-card'>With no risk and exciting rewards, bring your savings to the moon!</p>
                                </Card>
                            </div>
                        </div>
                    </Card>
                </div>
                <div id='howItWorks' className='winners col-12 d-flex flex-column align-items-center'>
                    <h1 className='text-center mb-4'>{I18n.t('landing.winners.title')}</h1>
                    <Card withoutPadding className='w-100 d-flex flex-xl-row flex-column align-items-center p-3 py-5 p-xl-5'>
                        <div className='d-flex flex-column align-items-center'>
                            <div className='square'>
                                <Lottie
                                    className='cosmonaut-coin'
                                    animationData={cosmonautWithCoin}
                                    actions={[
                                        {
                                            visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0, 0.2] : [0, 0.1],
                                            type: 'stop',
                                            frames: [0],
                                        },
                                        {
                                            visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.2, 0.4] : [0.1, 0.3],
                                            type: 'seek',
                                            frames: [0, 30],
                                        },
                                        {
                                            visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.4, 1] : [0.3, 1],
                                            type: 'loop',
                                            frames: [30, 100],
                                        },
                                    ]}
                                />
                            </div>
                            <div className='number'>1</div>
                            <span className='legend'>{I18n.t('landing.winners.p1')}</span>
                        </div>
                        <div className='mx-5'>
                            <img src={Assets.images.landingArrow} alt='arrow' className='arrow' />
                        </div>
                        <div className='d-flex flex-column align-items-center'>
                            <div className='square'>
                                <Lottie
                                    className='cosmonaut-balloons'
                                    animationData={cosmonautWithBalloons}
                                    actions={[
                                        {
                                            visibility: [0, 0.2],
                                            type: 'stop',
                                            frames: [0],
                                        },
                                        {
                                            visibility: [0.2, 0.4],
                                            type: 'seek',
                                            frames: [0, 30],
                                        },
                                        {
                                            visibility: [0.4, 1.0],
                                            type: 'loop',
                                            frames: [30, 128],
                                        },
                                    ]}
                                />
                            </div>
                            <div className='number'>2</div>
                            <span className='legend'>{I18n.t('landing.winners.p2')}</span>
                        </div>
                        <div className='d-flex d-xl-none'>
                            <img src={Assets.images.landingArrow} alt='arrow' className='arrow' />
                        </div>
                        <div className='mx-4'>
                            <img src={Assets.images.landingDoubleArrows} alt='Double arrows' className='arrow-double' />
                        </div>
                        <div className='image-group'>
                            <div className='d-flex flex-column flex-xl-row align-items-center'>
                                <div className='square'>
                                    <Lottie
                                        className='cosmonaut-duck'
                                        animationData={cosmonautWithDuck}
                                        actions={[
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0, 0.2] : [0, 0.35],
                                                type: 'stop',
                                                frames: [0],
                                            },
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.2, 0.4] : [0.35, 0.55],
                                                type: 'seek',
                                                frames: [0, 30],
                                            },
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.4, 1] : [0.55, 1],
                                                type: 'loop',
                                                frames: [30, 128],
                                            },
                                        ]}
                                    />
                                </div>
                                <div className='legend mt-3 mt-xl-0'>{I18n.t('landing.winners.p3')}</div>
                            </div>
                            <div className='or'>{I18n.t('landing.winners.or')}</div>
                            <div className='d-flex flex-column flex-xl-row align-items-center'>
                                <div className='square'>
                                    <Lottie
                                        className='cosmonaut-zen'
                                        animationData={cosmonautZen}
                                        actions={[
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0, 0.2] : [0, 0.25],
                                                type: 'stop',
                                                frames: [0],
                                            },
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.2, 0.4] : [0.25, 0.45],
                                                type: 'seek',
                                                frames: [0, 30],
                                            },
                                            {
                                                visibility: width < LandingConstants.LARGE_SIZE_SCREEN ? [0.4, 1] : [0.45, 1],
                                                type: 'loop',
                                                frames: [30, 128],
                                            },
                                        ]}
                                    />
                                </div>
                                <div className='legend mt-3 mt-xl-0'>{I18n.t('landing.winners.p4')}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='col-12 pools'>
                    <div className='d-flex justify-content-between align-items-center mb-4'>
                        <div className='d-flex align-items-lg-center flex-column flex-lg-row'>
                            <h1>{I18n.t('landing.pools.title')}</h1>
                        </div>
                        <div className='d-none d-xl-flex'>
                            <Button outline onClick={onClickDiscord}>
                                {I18n.t('landing.pools.newPool')}
                            </Button>
                        </div>
                    </div>
                    <div className='pools-cards-container cards-list'>
                        <PoolCard denom={'atom'} tvl={30000} prize={6123659} />
                        <PoolCard denom={'Pool #2 Soon'} tvl={0} prize={1283659} />
                        <PoolCard denom={'Pool #3 Soon'} tvl={0} prize={123659} />
                    </div>
                </div>
                <div id='faq' className='faq col-12'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <h1 className='mb-4'>{I18n.t('landing.faqSection.title')}</h1>
                    </div>
                    <Card>
                        {faqQuestions.map((question, index) => (
                            <Collapsible
                                key={`faq-question-${index}`}
                                header={question.title}
                                content={question.answer}
                                id={`faq-question-${index}`}
                                className={index > 0 && index < faqQuestions.length ? 'mt-4' : undefined}
                            />
                        ))}
                    </Card>
                </div>
                <div className='col-12 footer'>
                    <Lottie
                        className='cosmonaut-dab'
                        animationData={cosmonautDab}
                        delay={2500}
                        segments={[
                            [0, 30],
                            [30, 35],
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default Landing;
