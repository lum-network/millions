import React, { useEffect, useRef } from 'react';

import { I18n } from 'utils';
import { Button, Card, Lottie, Collapsible } from 'components';
import { LandingConstants, NavigationConstants } from 'constant';
import { gsap, Power1 } from 'gsap';
import cosmonautWithBalloons from 'assets/lotties/cosmonaut_with_balloons.json';
import cosmonautWithBalloons2 from 'assets/lotties/cosmonaut_with_balloons_2.json';
import cosmonautOnTheMoon from 'assets/lotties/cosmonaut_on_the_moon.json';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';
import cosmonautWithDuck from 'assets/lotties/cosmonaut_with_duck.json';
import cosmonautZen from 'assets/lotties/cosmonaut_zen.json';
import cosmonautInPool from 'assets/lotties/cosmonaut_in_pool.json';
import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';
import cosmonautDab from 'assets/lotties/cosmonaut_dab.json';
import numeral from 'numeral';
import Assets from 'assets';

import './Landing.scss';
import PoolCard from './components/PoolCard';
import TestimonialCard from './components/TestimonialCard';
import { useWindowSize } from 'hooks';

const Landing = () => {
    const onClickNewPool = () => {
        window.open(`${NavigationConstants.DISCORD}`, '_blank')?.focus();
    };

    const timeline = useRef<gsap.core.Timeline>();
    const { width } = useWindowSize();

    useEffect(() => {
        // GSAP Section Scroll Animations
        const scrollTrigger = {
            trigger: `#saving`,
            start: '5% top',
            end: '50% top',
            scrub: true,
        };
        gsap.to(`#saving .saving-title`, {
            translateY: -100,
            ease: 'none',
            scrollTrigger: scrollTrigger,
        });
        gsap.to(`#saving .description`, {
            translateY: -75,
            ease: 'none',
            scrollTrigger: scrollTrigger,
            stagger: 0.25,
        });
        gsap.to(`#saving .cta`, {
            translateY: -70,
            ease: 'none',
            scrollTrigger: scrollTrigger,
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
        }
    }, [width]);

    const faqQuestions = I18n.t('landing.faqSection.questions', { returnObjects: true });

    return (
        <div className='landing-container'>
            <div className='row g-5'>
                <div id='saving' className='saving-left col-12 col-xl-6 col-xxl-5'>
                    <h1 className='saving-title mb-4' dangerouslySetInnerHTML={{ __html: I18n.t('landing.saving.title') }} />
                    <div className='description'>
                        <p>{I18n.t('landing.saving.p1')}</p>
                        <p>{I18n.t('landing.saving.p2')}</p>
                    </div>
                    <Button className='cta' to={NavigationConstants.HOME}>
                        {I18n.t('landing.saving.cta')}
                    </Button>
                </div>
                <div className='d-none d-xxl-block col-xxl-1' />
                <div className='col-12 col-xl-6 col-xxl-6'>
                    <Card className='best-prize-card' withoutPadding>
                        <h3 className='pt-xl-5 pb-xl-4 ps-xl-5 py-4 ps-4'>{I18n.t('landing.saving.biggestPrizeToWin')}</h3>
                        <div className='content'>
                            <Lottie
                                className='cosmonaut-on-the-moon'
                                animationData={cosmonautOnTheMoon}
                                segments={[
                                    [0, 41],
                                    [41, 257],
                                ]}
                            />
                            <div className='best-prize-container'>
                                <div className='d-flex'>
                                    <span className='currency'>$</span>
                                    <span>{numeral(6757).format('0,0').replaceAll(',', '\u00a0')}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='position-relative cosmos-game-left col-12 col-xl-6 col-xxl-5'>
                    <Lottie
                        className='cosmos-with-balloons'
                        animationData={cosmonautWithBalloons2}
                        segments={[
                            [0, 20],
                            [20, 167],
                        ]}
                    />
                </div>
                <div className='d-none d-xxl-block col-xxl-1' />
                <div className='cosmos-game-right col-12 col-xl-6 col-xxl-6'>
                    <h1 className='mb-4'>{I18n.t('landing.cosmosGame.title')}</h1>
                    <p>{I18n.t('landing.cosmosGame.p1')}</p>
                    <p>{I18n.t('landing.cosmosGame.p2')}</p>
                    <p>{I18n.t('landing.cosmosGame.p3')}</p>
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
                                <div className='legend mt-3 mt-xl-0'>{I18n.t('landing.winners.p4')}</div>
                            </div>
                        </div>
                    </Card>
                </div>
                <div className='col-12 pools'>
                    <div className='d-flex justify-content-between align-items-center mb-4'>
                        <div className='d-flex align-items-lg-center flex-column flex-lg-row'>
                            <h1>{I18n.t('landing.pools.title')}</h1>
                            <div className='ms-lg-5 d-flex align-items-center'>
                                <img width={42} height={42} src={Assets.images.coinsStaked2} alt='Coins staked' className='coins-staked me-2' />
                                <div className='d-flex flex-column'>
                                    <span className='tvl-legend'>{I18n.t('landing.pools.tvl')}</span>
                                    <span className='tvl-value'>{numeral(300004567).format('$0,0').replaceAll(',', '\u00a0')}</span>
                                </div>
                            </div>
                        </div>
                        <div className='d-none d-xl-flex'>
                            <Button outline onClick={onClickNewPool}>
                                {I18n.t('landing.pools.newPool')}
                            </Button>
                        </div>
                    </div>
                    <div className='pools-cards-container cards-list'>
                        <PoolCard denom={'atom'} tvl={30000} prize={58} />
                        <PoolCard denom={'osmo'} tvl={30000} prize={58} />
                        <PoolCard denom={'lum'} tvl={56898865} prize={5000000} />
                    </div>
                    <div className='d-flex flex-column align-items-center mt-5'>
                        <Button className='d-block d-xl-none mb-4 cta' outline onClick={onClickNewPool}>
                            {I18n.t('landing.pools.newPool')}
                        </Button>
                        <Button className='cta' to={NavigationConstants.POOLS}>
                            {I18n.t('landing.pools.cta')}
                        </Button>
                    </div>
                </div>
                <div className='col-12 testimonials'>
                    <div className='testimonials-container cards-list'>
                        {LandingConstants.TESTIMONIALS.map((testimonial, index) => (
                            <TestimonialCard key={index} testimonial={testimonial} />
                        ))}
                    </div>
                </div>
                <div className='col-12 mt-xl-5 pt-xl-5 mt-0 pt-0' />
                <div className='future-left col-12 col-xl-7 order-1 order-xl-0'>
                    <h1 className='mb-4'>{I18n.t('landing.future.title')}</h1>
                    <p>{I18n.t('landing.future.p1')}</p>
                    <p>{I18n.t('landing.future.p2')}</p>
                    <Button to={NavigationConstants.HOME} className='cta'>
                        {I18n.t('landing.future.cta')}
                    </Button>
                </div>
                <div className='position-relative future-right col-12 col-xl-5 order-0 order-xl-1 d-flex justify-content-center align-self-center'>
                    <Lottie
                        className='cosmonaut-in-pool'
                        animationData={cosmonautInPool}
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
                <div className='community col-12 d-flex align-items-center flex-column order-2'>
                    <div className='col-xxl-7 col-xl-8 col-lg-9 col-md-10 col-12'>
                        <Card className='d-flex justify-content-between align-items-center flex-column flex-lg-row community-card'>
                            <Lottie
                                className='cosmonaut-rocket'
                                animationData={cosmonautWithRocket}
                                actions={[
                                    {
                                        visibility: [0, 0.2],
                                        type: 'stop',
                                        frames: [0],
                                    },
                                    {
                                        visibility: [0.2, 0.4],
                                        type: 'seek',
                                        frames: [0, 15],
                                    },
                                    {
                                        visibility: [0.4, 1.0],
                                        type: 'loop',
                                        frames: [15, 257],
                                    },
                                ]}
                            />
                            <div>
                                <h2 className='text-center text-lg-start'>{I18n.t('landing.community.title')}</h2>
                            </div>
                            <div className='d-flex mt-4 mt-lg-0'>
                                <a className='scale-hover me-lg-3 me-5' href={NavigationConstants.TWITTER} target='_blank' rel='noreferrer'>
                                    <img src={Assets.images.twitterPlain} alt='Twitter' />
                                </a>
                                <a className='scale-hover' href={NavigationConstants.DISCORD} target='_blank' rel='noreferrer'>
                                    <img src={Assets.images.discordPlain} alt='discord' />
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>
                <div className='faq col-12 order-2'>
                    <div className='d-flex justify-content-between align-items-center'>
                        <h1 className='mb-4'>{I18n.t('landing.faqSection.title')}</h1>
                    </div>
                    <Card>
                        {faqQuestions.map((question, index) => (
                            <Collapsible
                                key={`faq-question-${index}`}
                                title={question.title}
                                content={question.answer}
                                id={`faq-question-${index}`}
                                className={index > 0 && index < faqQuestions.length ? 'mt-4' : undefined}
                            />
                        ))}
                    </Card>
                </div>
                <div className='col-12 footer order-2'>
                    <Card>
                        <Lottie
                            className='cosmonaut-dab'
                            animationData={cosmonautDab}
                            actions={[
                                {
                                    visibility: [0, 0.1],
                                    type: 'stop',
                                    frames: [0],
                                },
                                {
                                    visibility: [0.1, 0.3],
                                    type: 'seek',
                                    frames: [0, 30],
                                },
                            ]}
                        />
                        Footer
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Landing;
