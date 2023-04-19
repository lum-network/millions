import React, { useEffect, useRef, useState } from 'react';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import { Tooltip } from 'react-tooltip';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, Card, Modal, SmallerDecimal, Steps } from 'components';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './Claim.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';
import { LumUtils } from '@lum-network/sdk-javascript';
import { NavigationConstants } from 'constant';
import { useNavigate } from 'react-router-dom';
import { PoolModel } from 'models';
import { ModalHandlers } from 'components/Modal/Modal';
import { flushSync } from 'react-dom';

interface Props {
    prizes: Prize[];
    prices: { [key: string]: number };
    pools: PoolModel[];
}

type ShareInfos = { hash: string; amount: string; denom: string; tvl: string; compounded: boolean };

const ShareClaim = ({ infos, modalRef }: { infos: ShareInfos; modalRef: React.RefObject<ModalHandlers> }) => {
    const navigate = useNavigate();

    return (
        <div className='text-center py-4'>
            <div className='mb-5 mb-lg-0'>
                <div className='card-step-title'>{I18n.t('mySavings.claimModal.steps', { returnObjects: true })[2].title}</div>
                <div className='card-step-subtitle'>{I18n.t('mySavings.claimModal.steps', { returnObjects: true })[2].subtitle}</div>
            </div>
            <div className='step-3 d-flex flex-column mt-5'>
                <div className='row row-cols-3'>
                    <div className='col step-3-cta-container'>
                        <button
                            className='scale-hover d-flex flex-column align-items-center justify-content-center'
                            onClick={() => {
                                if (modalRef.current) {
                                    modalRef.current.hide();
                                }
                                window.open(`${NavigationConstants.LUM_EXPLORER}/txs/${infos.hash}`, '_blank');
                            }}
                        >
                            <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                                <img src={Assets.images.lumLogoPurple} alt='Lum Network logo purple' />
                            </div>
                            {I18n.t('deposit.seeOnExplorer')}
                        </button>
                    </div>
                    <div className='col step-3-cta-container'>
                        <button
                            className='scale-hover d-flex flex-column align-items-center justify-content-center'
                            onClick={() => {
                                if (modalRef.current) {
                                    modalRef.current.hide();
                                }
                                window.open(`${NavigationConstants.MINTSCAN}/txs/${infos.hash}`, '_blank');
                            }}
                        >
                            <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                                <img src={Assets.images.mintscanPurple} alt='Mintscan' />
                            </div>
                            {I18n.t('deposit.seeOnMintscan')}
                        </button>
                    </div>
                    <div className='col step-3-cta-container'>
                        <button
                            className='scale-hover d-flex flex-column align-items-center justify-content-center'
                            onClick={() => {
                                if (modalRef.current) {
                                    modalRef.current.hide();
                                }
                                navigate(NavigationConstants.MY_SAVINGS);
                            }}
                        >
                            <div className='icon-container d-flex align-items-center justify-content-center mb-4'>
                                <img src={Assets.images.mySavings} alt='My savings' />
                            </div>
                            {I18n.t('deposit.goToMySavings')}
                        </button>
                    </div>
                </div>
                <Button
                    className='deposit-cta mt-5'
                    onClick={() => {
                        if (modalRef.current) {
                            modalRef.current.hide();
                        }
                        window.open(
                            `${NavigationConstants.TWEET_URL}?text=${encodeURI(
                                I18n.t(infos.compounded ? 'deposit.shareTwitterContent' : 'mySavings.claimModal.shareTwitterContent', {
                                    amount: infos.amount,
                                    denom: infos.denom,
                                    tvl: NumbersUtils.convertUnitNumber(infos.tvl) + ' ' + infos.denom,
                                }),
                            )}`,
                            '_blank',
                        );
                    }}
                >
                    <img src={Assets.images.twitterWhite} alt='Twitter' className='me-3' width={25} />
                    {I18n.t('deposit.shareTwitter')}
                </Button>
            </div>
        </div>
    );
};

const Claim = ({ prizes, prices, pools }: Props) => {
    const [claimOnly, setClaimOnly] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [shareInfos, setShareInfos] = useState<ShareInfos | null>(null);
    const modalRef = useRef<React.ElementRef<typeof Modal>>(null);

    const dispatch = useDispatch<Dispatch>();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.claimAndCompoundPrizes);
    const steps = I18n.t('mySavings.claimModal.steps', {
        returnObjects: true,
    });

    const onClaim = async (compound: boolean) => {
        if (!prizes.length) {
            return;
        }

        flushSync(() => setCurrentStep(currentStep + 1));

        const res = await (compound ? dispatch.wallet.claimAndCompoundPrizes(prizes) : dispatch.wallet.claimPrizes(prizes));

        if (!res || (res && res.error)) {
            setCurrentStep(currentStep - 1);
        } else {
            const pool = pools.find((pool) => pool.poolId.equals(prizes[0].poolId));

            setClaimOnly(false);
            setCurrentStep(2);
            setShareInfos({
                hash: LumUtils.toHex(res.hash).toUpperCase(),
                amount: prizes.reduce((acc, prize) => (prize.amount ? acc + NumbersUtils.convertUnitNumber(prize.amount.amount) : acc), 0).toString(),
                denom: prizes[0].amount?.denom || '',
                tvl: pool?.tvlAmount || '',
                compounded: compound,
            });
        }
    };

    useEffect(() => {
        const handler = () => {
            setCurrentStep(0);
            setClaimOnly(false);
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
    });

    return (
        <Modal id='claimModal' ref={modalRef} modalWidth={1080} withCloseButton={false}>
            <div className='row row-cols-1 row-cols-lg-2 h-100 gy-5'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('mySavings.claimModal.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} />
                </div>
                <div className={`col ${currentStep === 0 && !claimOnly ? 'd-flex' : ''}`}>
                    <Card withoutPadding className='d-flex flex-column justify-content-between px-5 py-3 flex-grow-1 glow-bg'>
                        {currentStep === 2 && shareInfos ? (
                            <ShareClaim infos={shareInfos} modalRef={modalRef} />
                        ) : (
                            <div className={`${!claimOnly ? 'h-100' : ''} d-flex flex-column justify-content-between text-center py-sm-4`}>
                                {claimOnly ? (
                                    <>
                                        <div className='mb-5 mb-lg-0'>
                                            <div className='card-step-title'>{I18n.t('mySavings.claimOnlyModal.title')}</div>
                                            <div className='card-step-subtitle'>{I18n.t('mySavings.claimOnlyModal.subtitle')}</div>
                                        </div>
                                        <Card flat withoutPadding className='fees-warning p-4 my-4'>
                                            {I18n.t('mySavings.claimOnlyModal.info')}
                                        </Card>
                                        <div className='d-flex flex-column align-items-stretch'>
                                            <Button type='button' outline onClick={() => onClaim(false)} className='w-100 me-3'>
                                                {I18n.t('mySavings.claimOnlyModal.claimBtn')}
                                            </Button>
                                            <Button type='button' onClick={() => onClaim(true)} className='w-100 mt-4'>
                                                {I18n.t('mySavings.claimOnlyModal.claimAndCompoundBtn')}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='mb-5 mb-lg-0'>
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
                                                                ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} <br /> {I18n.t('pools.poolId', { poolId: prize.poolId.toString() })} -
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
                                                        <Tooltip id='fees-tooltip' className='tooltip-light width-400' variant='light' />
                                                    </span>
                                                    {I18n.t('deposit.feesWarning')}
                                                </Card>
                                                <Button type='button' onClick={() => setClaimOnly(true)} outline className='w-100 mt-4'>
                                                    {I18n.t('mySavings.claimModal.claimMyPrizes')}
                                                </Button>
                                                <hr />
                                                <Button
                                                    type='button'
                                                    onClick={() => {
                                                        onClaim(true);
                                                    }}
                                                    className='w-100'
                                                    disabled={isLoading}
                                                    loading={isLoading}
                                                >
                                                    <img src={Assets.images.yellowStar} alt='Star' className='me-3' />
                                                    {I18n.t('mySavings.claimModal.claimAndCompound')}
                                                    <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default Claim;
