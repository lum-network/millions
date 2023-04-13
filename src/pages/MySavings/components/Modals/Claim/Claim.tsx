import React, { useEffect, useState } from 'react';
import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import Skeleton from 'react-loading-skeleton';
import { Tooltip } from 'react-tooltip';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';
import { Button, Card, Modal, SmallerDecimal, Steps } from 'components';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './Claim.scss';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from 'redux/store';

interface Props {
    prizes: Prize[];
    prices: { [key: string]: number };
}

const Claim = ({ prizes, prices }: Props) => {
    const [claimOnly, setClaimOnly] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    const dispatch = useDispatch<Dispatch>();

    const isLoading = useSelector((state: RootState) => state.loading.effects.wallet.claimAndCompoundPrizes);
    const steps = I18n.t('mySavings.claimModal.steps', {
        returnObjects: true,
    });

    const onClaim = async (compound: boolean) => {
        if (!prizes.length) {
            return;
        }

        setClaimOnly(false);
        setCurrentStep(currentStep + 1);

        const res = await (compound ? dispatch.wallet.claimAndCompoundPrizes(prizes) : dispatch.wallet.claimPrizes(prizes));

        if (!res || (res && res.error)) {
            setCurrentStep(currentStep - 1);
        } else {
            setCurrentStep(currentStep + 1);
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
        <Modal id='claimModal' modalWidth={1080} withCloseButton={false}>
            <div className='row row-cols-1 row-cols-lg-2 h-100 gy-5'>
                <div className='col text-start'>
                    <h1 className='steps-title'>{I18n.t('mySavings.claimModal.title')}</h1>
                    <Steps currentStep={currentStep} steps={steps} stepBackgroundColor='white' />
                </div>
                <div className={`col ${currentStep === 0 && !claimOnly ? 'd-flex' : ''}`}>
                    <Card withoutPadding className='d-flex flex-column justify-content-between px-5 py-3 flex-grow-1 glow-bg'>
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
                                                        acc + (prize.amount ? NumbersUtils.convertUnitNumber(prize.amount.amount) * (prices[DenomsUtils.getNormalDenom(prize.amount.denom)] || 1) : 0),
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
                                                            ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} <br /> Pool #{prize.poolId.toString()} - Draw #{prize.drawId.toString()}
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
                                            {isLoading ? (
                                                <Skeleton height={42} />
                                            ) : (
                                                <Card flat withoutPadding className='fees-warning'>
                                                    <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                                        <img src={Assets.images.info} alt='info' />
                                                        <Tooltip id='fees-tooltip' className='tooltip-light width-400' variant='light' />
                                                    </span>
                                                    {I18n.t('deposit.feesWarning')}
                                                </Card>
                                            )}
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
                    </Card>
                </div>
            </div>
        </Modal>
    );
};

export default Claim;
