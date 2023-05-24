import React, { useEffect, useRef, useState } from 'react';
import { LumTypes, LumUtils } from '@lum-network/sdk-javascript';
import { DepositState } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/deposit';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import dayjs from 'dayjs';
import numeral from 'numeral';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Assets from 'assets';
import { Button, Card, Modal, SmallerDecimal, Steps, Tooltip } from 'components';
import { ModalHandlers } from 'components/Modal/Modal';
import { NavigationConstants } from 'constant';
import { useVisibilityState } from 'hooks';
import { PoolModel } from 'models';
import { Dispatch, RootState } from 'redux/store';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';
import { confettis } from 'utils/confetti';

import './Claim.scss';

interface Props {
    prizes: Prize[];
    prices: { [key: string]: number };
    pools: PoolModel[];
}

type ShareInfos = { hash: string; amount: LumTypes.Coin[]; tvl: string; poolId: string; compounded: boolean };

const ShareClaim = ({ infos, prices, modalRef, onTwitterShare }: { infos: ShareInfos; prices: { [key: string]: number }; modalRef: React.RefObject<ModalHandlers>; onTwitterShare: () => void }) => {
    const navigate = useNavigate();

    return (
        <>
            <div className='d-flex flex-row justify-content-between align-items-center mb-5 mb-lg-0'>
                <div className='card-step-title'>{I18n.t('mySavings.claimModal.shareTitle')}</div>
            </div>
            <div className='step-3 d-flex flex-column mt-5'>
                {infos.amount.map((am, index) => (
                    <div key={`claim-prize-${index}`} className='deposit-card d-flex flex-row justify-content-between align-items-center py-4 px-5 mb-4'>
                        <div className='d-flex flex-row align-items-center'>
                            <img height={50} width={50} src={DenomsUtils.getIconFromDenom(am.denom.toLowerCase())} alt={am.denom} />
                            <div className='d-flex flex-column ms-3'>
                                <div className='deposit-amount text-start'>
                                    {am.amount} {DenomsUtils.getNormalDenom(am.denom).toUpperCase()}
                                </div>
                                <small className='deposit-infos text-start'>
                                    {numeral(am.amount)
                                        .multiply(prices[DenomsUtils.getNormalDenom(am.denom)] || 0)
                                        .format('$0,0[.]00')}{' '}
                                    - {I18n.t('pools.poolId', { poolId: infos.poolId })}
                                </small>
                            </div>
                        </div>
                        <div className='deposit-state rounded-pill text-nowrap success'>{I18n.t('mySavings.depositStates', { returnObjects: true })[DepositState.DEPOSIT_STATE_SUCCESS]}</div>
                    </div>
                ))}
                <div className='row row-cols-3 gx-4'>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center flex-grow-1 text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${infos.hash}`, '_blank');
                            }}
                        >
                            <img src={Assets.images.lumLogoPurple} alt='Lum Network logo purple' className='me-4' />
                            {I18n.t('deposit.seeOnExplorer')}
                        </Card>
                    </div>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center text-start p-4 w-100'
                            onClick={() => {
                                window.open(`${NavigationConstants.MINTSCAN}/txs/${infos.hash}`, '_blank');
                            }}
                        >
                            <img src={Assets.images.mintscanPurple} alt='Mintscan' className='me-4' />
                            {I18n.t('deposit.seeOnMintscan')}
                        </Card>
                    </div>
                    <div className='col'>
                        <Card
                            flat
                            withoutPadding
                            className='step-3-cta-container d-flex flex-row align-items-center text-start p-4 w-100'
                            onClick={() => {
                                if (modalRef.current) {
                                    modalRef.current.hide();
                                }
                                navigate(NavigationConstants.MY_SAVINGS);
                            }}
                        >
                            <img src={Assets.images.mySavings} alt='My savings' className='me-3' />
                            {I18n.t('deposit.goToMySavings')}
                        </Card>
                    </div>
                </div>
                <Button
                    className='deposit-cta align-self-center mt-5 mb-2'
                    onClick={() => {
                        window.open(
                            `${NavigationConstants.TWEET_URL}?text=${encodeURI(
                                I18n.t(infos.compounded ? 'deposit.shareTwitterContent' : 'mySavings.claimModal.shareTwitterContent', {
                                    amount: infos.amount[0].amount,
                                    denom: infos.amount[0].denom,
                                    tvl: infos.tvl + ' ' + infos.amount[0].denom,
                                }),
                            )}`,
                            '_blank',
                        );
                        onTwitterShare();
                    }}
                >
                    <img src={Assets.images.twitterWhite} alt='Twitter' className='me-3' width={25} />
                    {I18n.t('deposit.shareTwitter')}
                </Button>
            </div>
        </>
    );
};

const Claim = ({ prizes, prices, pools }: Props) => {
    const [claimOnly, setClaimOnly] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [shareInfos, setShareInfos] = useState<ShareInfos | null>(null);
    const [shareState, setShareState] = useState<('sharing' | 'shared') | null>(null);

    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const dispatch = useDispatch<Dispatch>();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.claimAndCompoundPrizes || state.loading.effects.wallet.claimPrizes);
    const steps = I18n.t('mySavings.claimModal.steps', {
        returnObjects: true,
    });

    const visibilityState = useVisibilityState();

    useEffect(() => {
        if (visibilityState === 'visible' && shareState === 'sharing') {
            setShareState('shared');
        }
    }, [visibilityState, shareState]);

    const onClaim = async (compound: boolean) => {
        if (!prizes.length) {
            return;
        }

        setCurrentStep(currentStep + 1);

        const res = await (compound ? dispatch.wallet.claimAndCompoundPrizes(prizes) : dispatch.wallet.claimPrizes(prizes));

        if (!res || (res && res.error)) {
            setCurrentStep(currentStep);
        } else {
            const pool = pools.find((pool) => pool.poolId.equals(prizes[0].poolId));
            const amount: LumTypes.Coin[] = [];

            for (const prize of prizes) {
                const denomExistIndex = amount.findIndex((am) => am.denom === DenomsUtils.getNormalDenom(prize.amount?.denom || ''));
                if (denomExistIndex === -1) {
                    amount.push({
                        amount: numeral(
                            prizes.filter((p) => p.amount?.denom === prize.amount?.denom).reduce((acc, prize) => (prize.amount ? acc + NumbersUtils.convertUnitNumber(prize.amount.amount) : acc), 0),
                        ).format('0,0'),
                        denom: DenomsUtils.getNormalDenom(prize.amount?.denom || ''),
                    });
                }
            }

            setClaimOnly(false);
            setCurrentStep(2);
            setShareInfos({
                hash: LumUtils.toHex(res.hash).toUpperCase(),
                amount,
                tvl: numeral(NumbersUtils.convertUnitNumber(pool?.tvlAmount || '')).format('0,0'),
                compounded: compound,
                poolId: pool?.poolId.toString() || '',
            });
            confettis(10000);
        }
    };

    useEffect(() => {
        const handler = () => {
            setCurrentStep(0);
            setClaimOnly(false);
            setShareInfos(null);
            setShareState(null);
        };

        const claimModal = document.getElementById('claimModal');

        if (claimModal) {
            claimModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (claimModal) {
                claimModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    return (
        <Modal id='claimModal' contentClassName={currentStep === 2 ? 'last-step' : ''} ref={modalRef} modalWidth={1080}>
            {currentStep === 2 && shareInfos ? (
                <ShareClaim infos={shareInfos} prices={prices} modalRef={modalRef} onTwitterShare={() => setShareState('sharing')} />
            ) : (
                <div className='row row-cols-1 row-cols-lg-2'>
                    <div className='col text-start'>
                        <h1 className='steps-title'>{I18n.t('mySavings.claimModal.title')}</h1>
                        <Steps currentStep={currentStep} steps={steps} lastStepChecked={shareState === 'shared'} />
                    </div>
                    <div className={`col ${currentStep === 0 && !claimOnly ? 'd-flex' : ''}`}>
                        <Card withoutPadding className='d-flex flex-column justify-content-between px-3 px-sm-5 py-3 flex-grow-1 glow-bg mt-5 mt-lg-0'>
                            <div className={`${!claimOnly ? 'h-100' : ''} d-flex flex-column justify-content-between text-center py-sm-4`}>
                                {claimOnly ? (
                                    <>
                                        <div className='mb-3 mb-sm-5 mb-lg-0'>
                                            <div className='card-step-title'>{I18n.t('mySavings.claimOnlyModal.title')}</div>
                                            <div className='card-step-subtitle'>{I18n.t('mySavings.claimOnlyModal.subtitle')}</div>
                                        </div>
                                        <Card flat withoutPadding className='fees-warning p-4 my-4'>
                                            {I18n.t('mySavings.claimOnlyModal.info')}
                                        </Card>
                                        <div className='d-flex flex-column align-items-stretch'>
                                            <Button type='button' outline onClick={() => onClaim(false)} loading={isLoading} disabled={isLoading} className='w-100 me-3'>
                                                {I18n.t('mySavings.claimOnlyModal.claimBtn')}
                                            </Button>
                                            <Button type='button' onClick={() => onClaim(true)} loading={isLoading} disabled={isLoading} className='w-100 mt-4'>
                                                {I18n.t('mySavings.claimOnlyModal.claimAndCompoundBtn')}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='mb-3 mb-sm-5 mb-lg-0'>
                                            <div className='card-title d-flex flex-row align-items-baseline justify-content-center'>
                                                <img src={Assets.images.trophy} alt='Trophy' className='me-3' />
                                                {I18n.t('mySavings.claimModal.cardTitle')}
                                            </div>
                                            <div className='card-subtitle d-flex flex-row align-items-baseline justify-content-center mt-2'>
                                                <img src={Assets.images.yellowStar} alt='Star' className='me-2' width='25' />$
                                                {numeral(
                                                    prizes.reduce(
                                                        (acc, prize) =>
                                                            acc +
                                                            (prize.amount ? NumbersUtils.convertUnitNumber(prize.amount.amount) * (prices[DenomsUtils.getNormalDenom(prize.amount.denom)] || 1) : 0),
                                                        0,
                                                    ),
                                                ).format('0,0')}
                                                <img src={Assets.images.yellowStar} alt='Star' className='ms-2' width='25' />
                                            </div>
                                        </div>
                                        <div className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
                                            <div className='w-100 mt-3'>
                                                {prizes.map((prize, index) =>
                                                    prize.amount ? (
                                                        <div key={`prize-to-claim-${index}`} className={`prize-card ${index > 0 ? 'mt-4' : ''}`}>
                                                            <div className='d-flex flex-row align-items-end justify-content-between text-start mb-2'>
                                                                ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} <br /> {I18n.t('pools.poolId', { poolId: prize.poolId.toString() })} -{' '}
                                                                {I18n.t('mySavings.claimModal.drawId', { drawId: prize.drawId.toString() })}
                                                                <div className='date'>{dayjs(prize.createdAt).format('dddd, MMMM D h:mm A')}</div>
                                                            </div>
                                                            <Card withoutPadding flat className='d-flex flex-row align-items-center text-start px-4 py-3'>
                                                                <img src={DenomsUtils.getIconFromDenom(prize.amount.denom)} className='denom-icon me-3' alt='Denom' />
                                                                <div className='d-flex flex-column'>
                                                                    <span className='asset-amount'>
                                                                        <SmallerDecimal nb={NumbersUtils.formatTo6digit(NumbersUtils.convertUnitNumber(prize.amount.amount))} className='me-2' />
                                                                        {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                                                                    </span>
                                                                    <p>
                                                                        $
                                                                        {numeral(
                                                                            NumbersUtils.convertUnitNumber(prize.amount.amount) * (prices[DenomsUtils.getNormalDenom(prize.amount.denom)] || 1),
                                                                        ).format('0,0.00')}
                                                                    </p>
                                                                </div>
                                                            </Card>
                                                        </div>
                                                    ) : null,
                                                )}
                                            </div>
                                            <div className='mt-4'>
                                                <Card flat withoutPadding className='fees-warning'>
                                                    <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                                        <img src={Assets.images.info} alt='info' />
                                                        <Tooltip id='fees-tooltip' delay={2000} />
                                                    </span>
                                                    {I18n.t('deposit.feesWarning')}
                                                </Card>
                                                <Button
                                                    type='button'
                                                    onClick={() => {
                                                        onClaim(true);
                                                    }}
                                                    className='w-100 mt-4'
                                                    disabled={isLoading}
                                                    loading={isLoading}
                                                >
                                                    <img src={Assets.images.yellowStar} alt='Star' className='me-3' />
                                                    {I18n.t('mySavings.claimModal.claimAndCompound')}
                                                    <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
                                                </Button>
                                                <hr />
                                                <Button type='button' onClick={() => setClaimOnly(true)} outline loading={isLoading} disabled={isLoading} className='w-100'>
                                                    {I18n.t('mySavings.claimModal.claimMyPrizes')}
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default Claim;
