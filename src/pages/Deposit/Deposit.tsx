import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useParams, unstable_useBlocker as useBlocker, useBeforeUnload, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { LumConstants } from '@lum-network/sdk-javascript';
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { SwapTab, ThemeContextProvider, WalletClientContextProvider, ThemeDefinition, WalletClientContext, defaultBlurs, defaultBorderRadii } from '@leapwallet/elements';

import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';

import Assets from 'assets';
import { Button, Card, Lottie, Modal, PurpleBackgroundImage, Steps } from 'components';
import { FirebaseConstants, NavigationConstants } from 'constant';
import { useColorScheme, usePrevious, useVisibilityState } from 'hooks';
import { PoolModel } from 'models';
import { DenomsUtils, Firebase, I18n, NumbersUtils, WalletUtils, WalletProvidersUtils } from 'utils';
import { confettis } from 'utils/confetti';
import { RootState, Dispatch } from 'redux/store';

import DepositSteps from './components/DepositSteps/DepositSteps';
import QuitDepositModal from './components/Modals/QuitDeposit/QuitDeposit';
import IbcTransferModal from './components/Modals/IbcTransfer/IbcTransfer';
import Error404 from '../404/404';

import './Deposit.scss';

const GSAP_DEFAULT_CONFIG = { ease: CustomEase.create('custom', 'M0,0 C0.092,0.834 0.26,1 1,1 ') };

const Deposit = () => {
    const { poolId, denom } = useParams<NavigationConstants.PoolsParams>();
    const location = useLocation();

    const { otherWallets, lumWallet, prices, pools, pool, depositDelta, isTransferring } = useSelector((state: RootState) => ({
        otherWallets: state.wallet.otherWallets,
        lumWallet: state.wallet.lumWallet,
        prices: state.stats.prices,
        pools: state.pools.pools,
        pool: poolId ? state.pools.pools.find((pool) => pool.poolId.toString() === poolId) : state.pools.pools.find((pool) => pool.nativeDenom === 'u' + denom),
        depositDelta: state.pools.depositDelta,
        isTransferring: state.loading.effects.wallet.ibcTransfer,
    }));

    const existsInLumBalances = lumWallet?.balances?.find((balance) => DenomsUtils.getNormalDenom(balance.denom) === denom);
    const [currentStep, setCurrentStep] = useState(
        existsInLumBalances && denom !== LumConstants.LumDenom && NumbersUtils.convertUnitNumber(existsInLumBalances.amount) > NumbersUtils.convertUnitNumber(pool?.minDepositAmount || '0') ? 1 : 0,
    );
    const [shareState, setShareState] = useState<('sharing' | 'shared') | null>(null);
    const [ibcModalPrevAmount, setIbcModalPrevAmount] = useState<string>('0');
    const [ibcModalDepositAmount, setIbcModalDepositAmount] = useState<string>('0');
    const [timeline] = useState<gsap.core.Timeline>(
        gsap.timeline({
            defaults: GSAP_DEFAULT_CONFIG,
            smoothChildTiming: true,
        }),
    );
    const [computedStyles, setComputedStyles] = useState(getComputedStyle(document.body));

    const depositFlowContainerRef = useRef(null);
    const quitModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const ibcModalRef = useRef<React.ElementRef<typeof Modal>>(null);
    const leapSwapModalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const dispatch = useDispatch<Dispatch>();

    const prevStep = usePrevious(currentStep);
    const { isDark } = useColorScheme();

    const wcConfig: WalletClientContext = {
        userAddress: lumWallet?.address,
        connectWallet: () => {
            // do nothing
        },
        walletClient: {
            enable: async (chainIds) => {
                const autoConnectProvider = WalletUtils.getAutoconnectProvider();
                if (autoConnectProvider) {
                    const providerFunctions = WalletProvidersUtils.getProviderFunctions(autoConnectProvider);

                    for (const chainId of chainIds) {
                        await providerFunctions.enable(chainId);
                    }
                }
            },
            getKey: async (chainId) => {
                const autoConnectProvider = WalletUtils.getAutoconnectProvider();
                if (autoConnectProvider) {
                    const providerFunctions = WalletProvidersUtils.getProviderFunctions(autoConnectProvider);

                    return await providerFunctions.getKey(chainId);
                }

                return {
                    address: new Uint8Array(),
                    pubKey: new Uint8Array(),
                    name: '',
                    algo: '',
                    isNanoLedger: false,
                    bech32Address: '',
                };
            },
            getOfflineSigner: (chainId) => {
                const autoConnectProvider = WalletUtils.getAutoconnectProvider();

                const providerFunctions = WalletProvidersUtils.getProviderFunctions(autoConnectProvider!);

                return providerFunctions.getOfflineSigner(chainId);
            },
        },
    };

    const leapModalTheme: ThemeDefinition = {
        colors: {
            primary: computedStyles.getPropertyValue('--color-purple'),
            primaryButton: computedStyles.getPropertyValue('--color-purple'),
            text: computedStyles.getPropertyValue('--color-purple'),
            primaryButtonText: 'white',
            textSecondary: computedStyles.getPropertyValue('--color-muted'),
            border: computedStyles.getPropertyValue('--color-purple-light'),
            stepBorder: computedStyles.getPropertyValue('--color-purple-light'),
            alpha: computedStyles.getPropertyValue('--color-purple'),
            gray: computedStyles.getPropertyValue('--color-grey'),
            backgroundPrimary: computedStyles.getPropertyValue('--color-background'),
            backgroundSecondary: computedStyles.getPropertyValue('--color-white'),
            error: computedStyles.getPropertyValue('--color-failure'),
            errorBackground: computedStyles.getPropertyValue('--color-failure-light'),
            success: computedStyles.getPropertyValue('--color-success'),
            successBackground: computedStyles.getPropertyValue('--color-success-light'),
        },
        borderRadii: defaultBorderRadii,
        blurs: defaultBlurs,
        fontFamily: 'Gotham Rounded',
    };

    const transferForm = useFormik({
        initialValues: {
            amount: location.state?.amountToDeposit || '',
        },
        validationSchema: yup.object().shape({
            amount: yup
                .string()
                .required(I18n.t('errors.generic.required', { field: 'Amount' }))
                .test(
                    'min-deposit',
                    () => I18n.t('errors.deposit.lessThanMinDeposit', { minDeposit: NumbersUtils.convertUnitNumber(pool?.minDepositAmount || '0'), denom: denom?.toUpperCase() }),
                    (value) => (pool && pool.minDepositAmount && value ? Number(value) >= NumbersUtils.convertUnitNumber(pool.minDepositAmount) : false),
                ),
        }),
        onSubmit: async (values) => {
            const amount = values.amount.toString();

            if (pool && pool.internalInfos) {
                const res = await dispatch.wallet.ibcTransfer({
                    type: 'deposit',
                    fromAddress: otherWallet.address,
                    toAddress: lumWallet?.address || '',
                    amount: {
                        amount,
                        denom: pool.nativeDenom,
                    },
                    normalDenom: DenomsUtils.getNormalDenom(pool.nativeDenom),
                    ibcChannel: pool.chainId.includes('testnet') || pool.chainId.includes('devnet') ? pool.internalInfos.ibcTestnetSourceChannel : pool.internalInfos.ibcSourceChannel,
                    chainId: pool.chainId,
                });

                if (res && !res.error) {
                    startTransition();
                }
            }
        },
    });

    const blocker = useBlocker(transferForm.dirty && currentStep < 2);
    const visibilityState = useVisibilityState();

    const steps = I18n.t('deposit.steps', {
        returnObjects: true,
        denom: DenomsUtils.getNormalDenom(denom || '').toUpperCase(),
        chainName: pool?.internalInfos?.chainName || 'Native Chain',
        provider: WalletUtils.getAutoconnectProvider(),
    });

    const now = Date.now();
    const nextDrawAt = pool && pool.nextDrawAt ? pool.nextDrawAt.getTime() : now;

    const withinDepositDelta = (nextDrawAt - now) / 1000 < (depositDelta || 0);

    const cardTimeline = () => {
        const tl = gsap.timeline(GSAP_DEFAULT_CONFIG);

        tl.from('#depositFlow .deposit-step-card', {
            opacity: 0,
            y: 100,
        });

        return tl;
    };

    const step1Timeline = () => {
        const tl = gsap.timeline(GSAP_DEFAULT_CONFIG);
        const cardStepSubtitleST = new SplitText('#depositFlow .step-1 .card-step-subtitle', { type: 'lines' });

        tl.from(
            '#depositFlow .step-1 .card-step-title',
            {
                opacity: 0,
                y: 50,
            },
            '<0.1',
        )
            .from(
                cardStepSubtitleST.lines,
                {
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                },
                '<0.1',
            )
            .fromTo(
                '#depositFlow .amount-input',
                {
                    opacity: 0,
                    y: 50,
                },
                {
                    opacity: 1,
                    y: 0,
                },
                '<0.1',
            );

        if (pools.length > 1) {
            tl.fromTo(
                '#depositFlow .step-1 .custom-select',
                {
                    opacity: 0,
                    y: 50,
                },
                {
                    opacity: 1,
                    y: 0,
                },
                '<0.1',
            );
        }

        tl.fromTo(
            '#depositFlow .winning-chance-card',
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
            },
            '<0.1',
        )
            .fromTo(
                '#depositFlow .deposit-cta .deposit-cta-bg',
                {
                    opacity: 0,
                    scaleX: 0.01,
                },
                {
                    opacity: 1,
                    scaleX: 1,
                    transformOrigin: 'center center',
                    duration: 0.4,
                },
                '<0.1',
            )
            .fromTo(
                '#depositFlow .deposit-cta .deposit-cta-text',
                {
                    opacity: 0,
                    y: 50,
                },
                {
                    opacity: 1,
                    y: 0,
                },
                '<0.2',
            );

        return tl;
    };

    const step2Timeline = () => {
        const tl = gsap.timeline(GSAP_DEFAULT_CONFIG);
        const ctaST = new SplitText('#depositFlow .step-2 .deposit-cta .deposit-cta-text', { type: 'words' });
        const cardStepSubtitleST = new SplitText('#depositFlow .step-2 .card-step-subtitle', { type: 'lines' });

        tl.from(
            '#depositFlow .step-2 .card-step-title',
            {
                opacity: 0,
                y: 50,
            },
            '<0.1',
        )
            .from(
                cardStepSubtitleST.lines,
                {
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                },
                '<0.1',
            )
            .from(
                '#depositFlow .step-2 .deposit-warning',
                {
                    opacity: 0,
                    y: 50,
                },
                '<0.1',
            )
            .from(
                '#depositFlow .step-2 .step2-input-container',
                {
                    opacity: 0,
                    y: 50,
                },
                '<0.1',
            );

        if (pools.length > 1) {
            tl.from(
                '#depositFlow .step-2 .custom-select',
                {
                    opacity: 0,
                    y: 50,
                },
                '<0.1',
            );
        }

        tl.from(
            '#depositFlow .step-2 .fees-warning',
            {
                opacity: 0,
                y: 50,
            },
            '<0.1',
        )
            .from(
                '#depositFlow .step-2 .deposit-cta .deposit-cta-bg',
                {
                    opacity: 0,
                    scaleX: 0.01,
                    transformOrigin: 'center center',
                    duration: 0.4,
                },
                '<0.1',
            )
            .from(
                ctaST.words,
                {
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                },
                '<0.2',
            )
            .from('#depositFlow .step-2 .deposit-cta .star', {
                scale: 0,
                duration: 0.2,
            });

        return tl;
    };

    const shareStepTimeline = () => {
        const tl = gsap.timeline(GSAP_DEFAULT_CONFIG);
        const splitText = new SplitText('#depositFlow .step-3 .card-step-title', { type: 'words,chars' });
        const cardStepSubtitleST = new SplitText('#depositFlow .step-3 .card-step-subtitle', { type: 'lines' });
        const ctaST = new SplitText('#depositFlow .step-3 .deposit-cta .deposit-cta-text', { type: 'words' });

        tl.fromTo(
            splitText.chars,
            {
                opacity: 0,
                y: 50,
            },
            {
                opacity: 1,
                y: 0,
                stagger: 0.01,
            },
        )
            .call(() => confettis(5000), undefined, '<')
            .from(
                cardStepSubtitleST.lines,
                {
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                },
                '<0.1',
            )
            .from(
                '#depositFlow .step-3 .deposit-card',
                {
                    opacity: 0,
                    y: 50,
                },
                '<0.1',
            )
            .from(
                '#depositFlow .step-3 .ctas-section',
                {
                    opacity: 0,
                    y: 50,
                },
                '<0.1',
            )
            .from(
                '#depositFlow .step-3 .deposit-cta .deposit-cta-bg',
                {
                    opacity: 0,
                    scaleX: 0.01,
                    transformOrigin: 'center center',
                    duration: 0.4,
                },
                '<0.1',
            )
            .from(
                ctaST.words,
                {
                    opacity: 0,
                    y: 50,
                    stagger: 0.1,
                },
                '<0.2',
            )
            .from('#depositFlow .step-3 .deposit-cta .twitter', {
                scale: 0,
                duration: 0.2,
            });

        return tl;
    };

    const startTransition = () => {
        const stepsArray = gsap.utils.toArray<HTMLElement>('#depositFlow .steps .step');
        const completedStepElement = stepsArray.find((_, index) => index === currentStep);
        const nextStepElement = stepsArray.find((_, index) => index === currentStep + 1);

        if (completedStepElement) {
            const title = completedStepElement.querySelector('.title');
            const subtitle = completedStepElement.querySelector('.subtitle');
            const checkmarkContainer = completedStepElement.querySelector('.step-index-container .checkmark-container');
            const checkmarkIcon = completedStepElement.querySelector('.step-index-container img');

            const checkTl = gsap.timeline(GSAP_DEFAULT_CONFIG);

            checkTl
                .fromTo(
                    checkmarkContainer,
                    {
                        scale: 0.01,
                    },
                    {
                        scale: 1,
                        duration: 0.3,
                    },
                )
                .fromTo(
                    checkmarkIcon,
                    {
                        scale: 0,
                    },
                    {
                        scale: 1,
                        duration: 0.3,
                    },
                );

            const textTl = gsap.timeline(GSAP_DEFAULT_CONFIG);

            textTl
                .set(title, { opacity: 1 })
                .set(subtitle, { opacity: 1 })
                .to(title, {
                    y: -50,
                    opacity: 0,
                })
                .to(
                    subtitle,
                    {
                        y: -50,
                        opacity: 0,
                    },
                    '<',
                )
                .set(title, { color: '#34ad09' })
                .set(subtitle, { color: '#34ad09' })
                .fromTo(
                    title,
                    {
                        y: 50,
                        opacity: 0,
                        immediateRender: false,
                    },
                    {
                        y: 0,
                        opacity: 1,
                    },
                )
                .fromTo(
                    subtitle,
                    {
                        y: 50,
                        opacity: 0,
                        immediateRender: false,
                    },
                    {
                        y: 0,
                        opacity: 0.3,
                    },
                    '<0.1',
                );

            if (completedStepElement.classList.contains('with-line')) {
                textTl.fromTo(
                    completedStepElement,
                    {
                        '--primary-line-height': 0,
                    },
                    {
                        '--primary-line-height': '100%',
                        duration: 0.3,
                    },
                    '<0.1',
                );

                if (nextStepElement) {
                    textTl
                        .call(() => setCurrentStep(currentStep + 1), undefined, '<0.1')
                        .fromTo(
                            nextStepElement,
                            {
                                '--border-progress': 0,
                                immediateRender: false,
                            },
                            {
                                '--border-progress': '100%',
                                stagger: 0.1,
                                duration: 0.2,
                            },
                            '<0.1',
                        )
                        .fromTo(
                            nextStepElement.querySelector('index-text'),
                            {
                                opacity: 0,
                                scale: 0,
                            },
                            {
                                opacity: 1,
                                scale: 1,
                                stagger: 0.1,
                                duration: 0.2,
                            },
                            '<0.1',
                        );
                }
            }
        }

        const cardTl = gsap.timeline(GSAP_DEFAULT_CONFIG);

        if (currentStep + 1 < steps.length) {
            cardTl
                .set('#depositFlow .deposit-steps .card-content', {
                    opacity: 0,
                })
                .add(
                    gsap.fromTo(
                        '#depositFlow .deposit-step-card',
                        {
                            opacity: 1,
                            y: 0,
                        },
                        {
                            opacity: 0,
                            y: -150,
                        },
                    ),
                )
                .add(cardTimeline(), '<0.2');
        } else {
            cardTl.call(() => setCurrentStep(currentStep + 1)).add(cardTimeline(), '<0.2');
        }
    };

    const onDeposit = async (poolToDeposit: PoolModel, depositAmount: string) => {
        const maxAmount = Number(WalletUtils.getMaxAmount(poolToDeposit.nativeDenom, lumWallet?.balances || []));
        const depositAmountNumber = Number(depositAmount);

        if (depositAmountNumber > maxAmount) {
            const prev = depositAmount;
            const next = (depositAmountNumber - maxAmount).toFixed(6);

            transferForm.setFieldValue('amount', next);
            setIbcModalPrevAmount(prev);
            setIbcModalDepositAmount(next);

            if (ibcModalRef.current) {
                ibcModalRef.current.show();
            }

            return null;
        }

        return await dispatch.wallet.depositToPool({ pool: poolToDeposit, amount: depositAmount });
    };

    useEffect(() => {
        if (blocker.state === 'blocked') {
            if (!transferForm.dirty) {
                blocker.reset();
            } else {
                if (quitModalRef.current) {
                    Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.QUIT_DEPOSIT_FLOW_MODAL_OPEN);
                    quitModalRef.current.toggle();
                }
            }
        }
    }, [blocker, transferForm]);

    useBeforeUnload(
        useCallback(
            (event) => {
                if (transferForm.dirty) {
                    event.preventDefault();

                    return (event.returnValue = '');
                }
            },
            [transferForm],
        ),
        { capture: true },
    );

    useEffect(() => {
        if (visibilityState === 'visible' && shareState === 'sharing') {
            setShareState('shared');
        }
    }, [visibilityState, shareState]);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const splitText = new SplitText('#depositFlow .steps-title', { type: 'words,chars' });
            timeline.fromTo(
                splitText.chars,
                {
                    opacity: 0,
                    y: 50,
                },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.01,
                },
            );

            gsap.utils.toArray<HTMLElement>('#depositFlow .step').forEach((step, index) => {
                const indexBorder = step.querySelector('.index-default-border');
                const indexText = step.querySelector('.index-text');
                const title = step.querySelector('.title');
                const subtitle = step.querySelector('.subtitle');
                const checkmarkContainer = step.querySelector('.step-index-container .checkmark-container');
                const checkmarkIcon = step.querySelector('.step-index-container img');

                if (timeline) {
                    if (step.classList.contains('completed')) {
                        timeline
                            .fromTo(
                                checkmarkContainer,
                                {
                                    scale: 0.01,
                                },
                                {
                                    scale: 1,
                                    duration: 0.3,
                                },
                            )
                            .fromTo(
                                checkmarkIcon,
                                {
                                    scale: 0,
                                },
                                {
                                    scale: 1,
                                    duration: 0.3,
                                },
                            );
                    } else {
                        timeline.fromTo(
                            step,
                            {
                                '--border-progress': 0,
                            },
                            {
                                '--border-progress': '100%',
                                stagger: 0.1,
                                duration: 0.2,
                            },
                            index > 0 ? '<0.1' : '>',
                        );
                    }

                    timeline
                        .set(indexBorder, { opacity: 1 })
                        .fromTo(
                            indexText,
                            {
                                opacity: 0,
                                scale: 0,
                            },
                            {
                                opacity: 1,
                                scale: 1,
                                stagger: 0.1,
                                duration: 0.2,
                            },
                            index > 0 ? '<0.1' : '>',
                        )
                        .fromTo(
                            title,
                            {
                                autoAlpha: 0,
                                y: 50,
                            },
                            {
                                autoAlpha: step.classList.contains('active') || step.classList.contains('completed') ? 1 : 0.6,
                                y: 0,
                            },
                            '<0.3',
                        )
                        .fromTo(
                            subtitle,
                            {
                                autoAlpha: 0,
                                y: 50,
                            },
                            {
                                autoAlpha: step.classList.contains('active') ? 1 : step.classList.contains('completed') ? 0.3 : 0.6,
                                y: 0,
                            },
                            '<0.1',
                        );
                    if (step.classList.contains('with-line')) {
                        if (step.classList.contains('completed')) {
                            timeline.fromTo(
                                step,
                                {
                                    '--primary-line-height': 0,
                                },
                                {
                                    '--primary-line-height': '100%',
                                    duration: 0.3,
                                },
                                '<',
                            );
                        } else {
                            timeline.fromTo(
                                step,
                                {
                                    '--grey-line-height': 0,
                                },
                                {
                                    '--grey-line-height': '100%',
                                    duration: 0.3,
                                },
                                '<',
                            );
                        }
                    }
                }
            });

            timeline.from('#depositFlow .deposit-delta-card', {
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
            });

            timeline.add(cardTimeline(), '<0.2');

            if (currentStep === 0) {
                if (denom === LumConstants.LumDenom) {
                    timeline.add(step2Timeline());
                } else {
                    timeline.add(step1Timeline());
                }
            } else if (currentStep === 1) {
                timeline.add(step2Timeline());
            }
        }, depositFlowContainerRef);

        return () => ctx.revert();
    }, []);

    useEffect(() => {
        if (currentStep > 0 && prevStep !== undefined) {
            if (currentStep !== steps.length) {
                timeline.set('#depositFlow .deposit-steps .card-content', {
                    opacity: 1,
                });
            }
            timeline.add(currentStep === steps.length ? shareStepTimeline() : step2Timeline(), '+=0.5');
        }
    }, [currentStep]);

    useEffect(() => {
        if (currentStep >= steps.length) {
            confettis(10000);
        }
    }, [currentStep]);

    useEffect(() => {
        Firebase.logEvent(FirebaseConstants.ANALYTICS_EVENTS.DEPOSIT_FLOW, {
            step: currentStep,
            denom: denom,
        });
    }, [currentStep]);

    useEffect(() => {
        setComputedStyles(getComputedStyle(document.body));
    }, [isDark]);

    if (pool === undefined) {
        return <Error404 />;
    }

    const otherWallet = otherWallets[denom || ''];

    if (denom === LumConstants.LumDenom) {
        steps.splice(0, 1);
    }

    const isShareStep = currentStep > steps.length;

    return (
        <div id='depositFlow' ref={depositFlowContainerRef}>
            <div className={`row row-cols-1 ${!isShareStep && 'row-cols-lg-2'} py-5 h-100 gy-5 justify-content-center deposit-flow-container`}>
                {!isShareStep && (
                    <div className='col'>
                        <h1 className='steps-title' dangerouslySetInnerHTML={{ __html: I18n.t('deposit.title') }} />
                        <Steps currentStep={currentStep} steps={steps} lastStepChecked={shareState === 'shared'} />
                        <Card flat withoutPadding className='deposit-delta-card d-flex flex-column flex-sm-row align-items-center mt-5'>
                            <PurpleBackgroundImage src={Assets.images.questionMark} alt='' className='no-filter rounded-circle' width={42} height={42} />
                            <div className='text-center text-sm-start ms-0 ms-sm-4 mt-3 mt-sm-0' dangerouslySetInnerHTML={{ __html: I18n.t('deposit.depositHint') }} />
                        </Card>
                        <Card flat withoutPadding className='deposit-delta-card d-flex flex-column flex-sm-row align-items-center mt-5'>
                            <PurpleBackgroundImage src={Assets.images.questionMark} alt='' className='no-filter rounded-circle' width={42} height={42} />
                            <div className='text-center text-sm-start ms-0 ms-sm-4 mt-3 mt-sm-0'>{"Don't have ATOM on Cosmos Hub, but on other chains ? Swap your ATOM to Cosmos Hub first"}</div>
                            <Button data-bs-target='#swap-modal' data-bs-toggle='modal' className='text-nowrap ms-3'>
                                Swap
                            </Button>
                        </Card>
                        {otherWallet?.balances.find(
                            (balance) => balance.denom === 'uatom' && NumbersUtils.convertUnitNumber(balance.amount) <= NumbersUtils.convertUnitNumber(pool.minDepositAmount),
                        ) && currentStep < steps.length - 1 ? (
                            <Card flat withoutPadding className='deposit-delta-card d-flex flex-column flex-sm-row align-items-center mt-5'>
                                <PurpleBackgroundImage src={Assets.images.questionMark} alt='' className='no-filter rounded-circle' width={42} height={42} />
                                <div className='text-center text-sm-start ms-0 ms-sm-4 mt-3 mt-sm-0'>{"Don't have ATOM on Cosmos Hub, but on other chains ? Swap your ATOM to Cosmos Hub first"}</div>
                                <Button data-bs-target='#swap-modal' data-bs-toggle='modal' className='text-nowrap ms-3'>
                                    Swap
                                </Button>
                            </Card>
                        ) : null}
                        {withinDepositDelta && (
                            <Card flat withoutPadding className='deposit-delta-card d-flex flex-column flex-sm-row align-items-center mt-5'>
                                <PurpleBackgroundImage src={Assets.images.questionMark} alt='' className='no-filter rounded-circle' width={42} height={42} />
                                <div className='text-center text-sm-start ms-0 ms-sm-4 mt-3 mt-sm-0' dangerouslySetInnerHTML={{ __html: I18n.t('deposit.depositDeltaHint') }} />
                            </Card>
                        )}
                    </div>
                )}
                <div className='col'>
                    <div className={`d-flex flex-column justify-content-between px-3 px-sm-5 py-3 deposit-step-card ${isShareStep ? 'last-step glow-bg' : ''}`}>
                        <DepositSteps
                            transferForm={transferForm}
                            onNextStep={startTransition}
                            onDeposit={onDeposit}
                            onFinishDeposit={(callback) => {
                                const tl = gsap.timeline({
                                    ...GSAP_DEFAULT_CONFIG,
                                    onComplete: () => {
                                        callback();
                                        gsap.set('#depositFlow .deposit-flow-container', {
                                            opacity: 1,
                                            delay: 0.2,
                                        });
                                    },
                                });

                                tl.to('#depositFlow .deposit-flow-container', {
                                    opacity: 0,
                                    y: -50,
                                }).set('#depositFlow .deposit-flow-container', {
                                    y: 0,
                                });
                            }}
                            onPrevStep={(prev, next) => {
                                transferForm.setFieldValue('amount', next);
                                setIbcModalPrevAmount(prev);
                                setIbcModalDepositAmount(next);
                                if (ibcModalRef.current) {
                                    ibcModalRef.current.show();
                                }
                            }}
                            onTwitterShare={() => setShareState('sharing')}
                            currentStep={currentStep}
                            steps={steps}
                            pools={pools.filter((pool) => pool.nativeDenom === 'u' + denom)}
                            currentPool={pool}
                            price={prices?.[denom || ''] || 0}
                            lumWallet={lumWallet}
                            otherWallets={otherWallets}
                            amountFromLocationState={location.state?.amountToDeposit}
                        />
                        {isShareStep && (
                            <Lottie
                                className='cosmonaut-rocket position-absolute start-0 top-100 translate-middle'
                                animationData={cosmonautWithRocket}
                                segments={[
                                    [0, 30],
                                    [30, 128],
                                ]}
                            />
                        )}
                    </div>
                </div>
            </div>
            <QuitDepositModal modalRef={quitModalRef} blocker={blocker} />
            <IbcTransferModal
                modalRef={ibcModalRef}
                denom={denom || ''}
                prevAmount={ibcModalPrevAmount}
                nextAmount={ibcModalDepositAmount}
                isLoading={isTransferring}
                price={prices[denom || ''] || 0}
                onConfirm={async () => {
                    const amount = transferForm.values.amount.toString();

                    if (pool && pool.internalInfos) {
                        const res = await dispatch.wallet.ibcTransfer({
                            type: 'deposit',
                            fromAddress: otherWallet.address,
                            toAddress: lumWallet?.address || '',
                            amount: {
                                amount,
                                denom: pool.nativeDenom,
                            },
                            normalDenom: DenomsUtils.getNormalDenom(pool.nativeDenom),
                            ibcChannel: pool.chainId.includes('testnet') || pool.chainId.includes('devnet') ? pool.internalInfos.ibcTestnetSourceChannel : pool.internalInfos.ibcSourceChannel,
                            chainId: pool.chainId,
                        });

                        if (res && !res.error) {
                            if (ibcModalRef.current) {
                                ibcModalRef.current.hide();
                            }
                        }
                    }
                }}
            />
            <Modal id='swap-modal' ref={leapSwapModalRef}>
                <h3 className='mt-4'>Swap ATOM to Cosmos Hub</h3>
                <div className='text-start'>
                    <ThemeContextProvider theme={leapModalTheme} customStylesParentSelector='#swap-modal'>
                        <WalletClientContextProvider value={wcConfig}>
                            <SwapTab
                                title=''
                                onTxnComplete={(summary) => {
                                    /* dispatch.wallet.reloadOtherWalletInfo({ address: otherWallet.address });
                                    if (summary.txnSteps[0] && summary.txnSteps[0].isComplete && summary.txnSteps[0].status === 'SUCCESS') {
                                        leapSwapModalRef.current?.hide();
                                    } */
                                }}
                                defaults={{
                                    sourceChainId: 'osmosis-1',
                                    sourceAssetDenom: 'uatom',
                                }}
                                allowedDestinationChains={[
                                    {
                                        chainId: 'cosmoshub-4',
                                        assetDenoms: ['uatom'],
                                    },
                                ]}
                            />
                        </WalletClientContextProvider>
                    </ThemeContextProvider>
                </div>
                <div className='mt-4 powered-by'>
                    <span>
                        <img alt='leap' src={Assets.images.leap} width={32} height={32} className='me-3' />
                        Powered by Leap
                    </span>
                </div>
            </Modal>
        </div>
    );
};

export default Deposit;
