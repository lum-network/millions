import { Prize } from '@lum-network/sdk-javascript/build/codec/lum-network/millions/prize';
import Assets from 'assets';
import { Button, Card, SmallerDecimal, Steps } from 'components';
import dayjs from 'dayjs';
import numeral from 'numeral';
import React, { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Tooltip } from 'react-tooltip';
import { DenomsUtils, I18n, NumbersUtils } from 'utils';

import './Claim.scss';

interface Props {
    onClaim: () => void;
    onClaimAndCompound: () => void;
    prizes: Prize[];
    isLoading: boolean;
    prices: { [key: string]: number };
}

const Claim = ({ prizes, onClaim, onClaimAndCompound, isLoading, prices }: Props) => {
    const [currentStep, setCurrentStep] = useState(0);

    const steps = I18n.t('myPlace.claimModal.steps', {
        returnObjects: true,
    });

    return (
        <div className='row row-cols-1 row-cols-lg-2 h-100 gy-5'>
            <div className='col text-start'>
                <h1 className='steps-title'>{I18n.t('myPlace.claimModal.title')}</h1>
                <Steps currentStep={currentStep} steps={steps} stepBackgroundColor='white' />
            </div>
            <div className='col d-flex'>
                <Card withoutPadding className='d-flex flex-column justify-content-between px-5 py-3 flex-grow-1 glow-bg'>
                    <div className='h-100 d-flex flex-column justify-content-between text-center py-sm-4'>
                        <div className='mb-5 mb-lg-0'>
                            <div className='card-title'>
                                <img src={Assets.images.trophy} alt='Trophy' className='me-3' />
                                {I18n.t('myPlace.claimModal.cardTitle')}
                            </div>
                            <div className='card-subtitle d-flex flex-row align-items-center justify-content-center'>
                                <img src={Assets.images.yellowStar} alt='Star' className='me-3' />$
                                {numeral(
                                    prizes.reduce(
                                        (acc, prize) => acc + (prize.amount ? NumbersUtils.convertUnitNumber(prize.amount.amount) * (prices[DenomsUtils.getNormalDenom(prize.amount.denom)] || 1) : 0),
                                        0,
                                    ),
                                ).format('0,0')}
                                <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
                            </div>
                        </div>
                        <div className={isLoading ? 'step-1 d-flex flex-column align-items-stretch w-100' : 'step-1'}>
                            <div className='w-100 mt-5'>
                                {prizes.map((prize, index) =>
                                    prize.amount ? (
                                        <div key={`prize-to-claim-${index}`} className={`prize-card ${index > 0 ? 'mt-4' : ''}`}>
                                            <div className='d-flex flex-row align-items-end justify-content-between mb-2'>
                                                ${DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()} DRAW #{prize.drawId.toString()}
                                                <div className='date'>{dayjs(prize.createdAt).format('dddd, MMMM D h:mm A')}</div>
                                            </div>
                                            <Card withoutPadding flat className='d-flex flex-row align-items-center text-start px-4 py-3'>
                                                <img src={DenomsUtils.getIconFromDenom(prize.amount.denom)} className='denom-icon me-3' alt='Denom' />
                                                <div className='d-flex flex-column'>
                                                    <span className='asset-amount'>
                                                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prize.amount.amount)).format('0,0.[00]')} className='me-2' />
                                                        {DenomsUtils.getNormalDenom(prize.amount.denom).toUpperCase()}
                                                    </span>
                                                    <p>
                                                        $
                                                        {NumbersUtils.formatTo6digit(
                                                            NumbersUtils.convertUnitNumber(prize.amount.amount) * (prices[DenomsUtils.getNormalDenom(prize.amount.denom)] || 1),
                                                        )}
                                                    </p>
                                                </div>
                                            </Card>
                                        </div>
                                    ) : null,
                                )}
                            </div>
                            <div className='mt-5'>
                                {isLoading ? (
                                    <Skeleton height={42} className='mt-4' />
                                ) : (
                                    <Card flat withoutPadding className='fees-warning mt-4'>
                                        <span data-tooltip-id='fees-tooltip' data-tooltip-html={I18n.t('deposit.fees')} className='me-2'>
                                            <img src={Assets.images.info} alt='info' />
                                            <Tooltip id='fees-tooltip' className='tooltip-light width-400' variant='light' />
                                        </span>
                                        {I18n.t('deposit.feesWarning')}
                                    </Card>
                                )}
                                <Button
                                    type='button'
                                    outline
                                    onClick={() => {
                                        onClaim();
                                        setCurrentStep(currentStep + 1);
                                    }}
                                    className='w-100 mt-4'
                                    disabled={isLoading}
                                    loading={isLoading}
                                >
                                    {I18n.t('myPlace.claimModal.claimMyPrizes')}
                                </Button>
                                <hr />
                                <Button
                                    type='button'
                                    onClick={() => {
                                        onClaimAndCompound();
                                        setCurrentStep(currentStep + 1);
                                    }}
                                    className='w-100'
                                    disabled={isLoading}
                                    loading={isLoading}
                                >
                                    <img src={Assets.images.yellowStar} alt='Star' className='me-3' />
                                    {I18n.t('myPlace.claimModal.claimAndCompound')}
                                    <img src={Assets.images.yellowStar} alt='Star' className='ms-3' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Claim;
