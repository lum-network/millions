import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import numeral from 'numeral';

import Assets from 'assets';
import cosmonautWithCoin from 'assets/lotties/cosmonaut_with_coin.json';
import cosmonautWithRocket from 'assets/lotties/cosmonaut_with_rocket.json';

import { Button, Card, Lottie, Modal, SmallerDecimal, Tooltip } from 'components';
import { NavigationConstants } from 'constant';
import { InfluencerCampaignModel } from 'models';
import { DenomsUtils, I18n } from 'utils';

import './InfluencerCampaign.scss';
import { LumUtils } from '@lum-network/sdk-javascript';

interface Props {
    campaign?: InfluencerCampaignModel;
    onApply: (campaignId: string, code: string) => Promise<{ hasParticipated: boolean; error: string | null }>;
    prices: { [key: string]: number };
}

const InfluencerCampaignModal = ({ campaign, prices, onApply }: Props) => {
    const [password, setPassword] = useState('');
    const [pwdError, setPwdError] = useState('');
    const [status, setStatus] = useState<'success' | null>(null);

    useEffect(() => {
        const handler = () => {
            setStatus(null);
            setPassword('');
            setPwdError('');
        };

        const campaignModal = document.getElementById('influencer-campaign-modal');

        if (campaignModal) {
            campaignModal.addEventListener('hidden.bs.modal', handler);
        }

        return () => {
            if (campaignModal) {
                campaignModal.removeEventListener('hidden.bs.modal', handler);
            }
        };
    }, []);

    const onApplyCode = async () => {
        if (!campaign) {
            return;
        }

        if (!password) {
            setPwdError(I18n.t('errors.generic.required', { field: 'Code' }));
        } else {
            const hashedPwd = LumUtils.sha3(password);
            const res = await onApply(campaign.id, hashedPwd);

            if (res.error) {
                setPwdError(res.error);
            } else {
                setStatus('success');
            }
        }
    };

    const SuccessContent = () => {
        return campaign ? (
            <>
                <div className='row'>
                    <div className='col-5'>
                        <div className='share-step-title'>{I18n.t('mySavings.influencerCampaignModal.shareStep.title')}</div>
                    </div>
                    <div className='col-7'>
                        <div className='d-flex flex-column justify-content-center h-100'>
                            <div
                                className='share-step-subtitle'
                                dangerouslySetInnerHTML={{ __html: I18n.t('mySavings.influencerCampaignModal.shareStep.description', { endDate: dayjs(campaign.endDate).add(1, 'day').format('L') }) }}
                            />
                        </div>
                    </div>
                </div>
                <div className='step-3 d-flex flex-column mt-5'>
                    <div className='deposit-card d-flex flex-row justify-content-between align-items-center py-4 px-5 mb-4'>
                        <div className='d-flex flex-row align-items-center'>
                            <img height={50} width={50} src={Assets.images.gift} alt='gift' />
                            <div className='d-flex flex-column ms-3'>
                                <div className='deposit-amount text-start'>
                                    <SmallerDecimal nb={campaign.amount.amount} /> {DenomsUtils.getNormalDenom(campaign.amount.denom).toUpperCase()}
                                </div>
                                <small className='deposit-infos text-start'>
                                    {numeral(campaign.amount.amount)
                                        .multiply(prices[DenomsUtils.getNormalDenom(campaign.amount.denom)] || 0)
                                        .format('$0,0[.]00')}{' '}
                                    - {DenomsUtils.getNormalDenom(campaign.amount.denom).toUpperCase()} {I18n.t('pools.poolId', { poolId: campaign.poolId })}
                                </small>
                            </div>
                        </div>
                        <div className='deposit-state rounded-pill text-nowrap success'>{I18n.t('mySavings.influencerCampaignModal.shareStep.successStatus')}</div>
                    </div>
                    <div className='d-flex flex-row align-items-center justify-content-center mt-5 mb-2'>
                        <Button className='deposit-cta me-4' data-bs-dismiss='modal' outline>
                            <img src={Assets.images.mySavings} alt='My savings' className='me-3' height={18} />
                            {I18n.t('deposit.goToMySavings').replace('\n', ' ')}
                        </Button>
                        <Button
                            className='deposit-cta'
                            data-bs-dismiss='modal'
                            onClick={() => {
                                window.open(
                                    `${NavigationConstants.TWEET_URL}?text=${encodeURI(
                                        I18n.t('mySavings.claimModal.shareTwitterContent', {
                                            amount: campaign.amount.amount,
                                            denom: campaign.amount.denom,
                                        }),
                                    )}`,
                                    '_blank',
                                );
                            }}
                        >
                            <img src={Assets.images.twitterWhite} alt='Twitter' className='me-3' height={18} />
                            {I18n.t('deposit.shareTwitter')}
                        </Button>
                    </div>
                </div>
                <Lottie
                    className='d-none d-md-block cosmonaut-with-rocket'
                    animationData={cosmonautWithRocket}
                    segments={[
                        [0, 30],
                        [30, 128],
                    ]}
                />
            </>
        ) : null;
    };

    return (
        <Modal id='influencer-campaign-modal' modalWidth={850}>
            {campaign ? (
                status === 'success' ? (
                    <SuccessContent />
                ) : (
                    <>
                        <Lottie
                            className='d-none d-md-block cosmonaut-with-coin'
                            animationData={cosmonautWithCoin}
                            segments={[
                                [0, 30],
                                [30, 100],
                            ]}
                        />
                        <h1>{I18n.t('mySavings.influencerCampaignModal.title', { influencerName: campaign.influencer.name, count: campaign.count })}</h1>
                        <div className='d-flex flex-row mt-4'>
                            <div className='position-relative'>
                                <img src={campaign.influencer.picture} className='influencer-picture' alt='influencer picture' />
                                <div className='influencer-username py-2'>@{campaign.influencer.username}</div>
                            </div>
                            <Card flat withoutPadding className='d-flex flex-column justify-content-center ms-3 flex-grow-1 p-4'>
                                <span className='campaign-amount me-auto mb-3'>
                                    <img src={Assets.images.gift} /> {I18n.t('mySavings.influencerCampaignModal.toWin', { amount: campaign.amount.amount, denom: campaign.amount.denom })}{' '}
                                    <span data-tooltip-id='campaign-amount-tooltip' data-tooltip-html={I18n.t('mySavings.influencerCampaignModal.hint')}>
                                        <img src={Assets.images.info} alt='info' />
                                        <Tooltip id='campaign-amount-tooltip' />
                                    </span>
                                </span>
                                <div className='campaign-expiration p-3 d-flex flex-row align-items-center'>
                                    <img src={Assets.images.clock} alt='clock' className='me-2' />
                                    <div dangerouslySetInnerHTML={{ __html: I18n.t('mySavings.influencerCampaignModal.claimWarning', { date: dayjs(campaign.endDate).format('L') }) }} />
                                </div>
                                <input
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className='px-4 py-2 my-3'
                                    placeholder={I18n.t('mySavings.influencerCampaignModal.placeholder')}
                                />
                                {pwdError ? <p className='code-error'>{pwdError}</p> : null}
                                <Button onClick={onApplyCode}>{I18n.t('mySavings.influencerCampaignModal.cta')}</Button>
                            </Card>
                        </div>
                    </>
                )
            ) : null}
        </Modal>
    );
};

export default InfluencerCampaignModal;
