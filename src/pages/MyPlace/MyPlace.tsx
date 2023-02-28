import React from 'react';
import { useSelector } from 'react-redux';
import numeral from 'numeral';
import { LumTypes } from '@lum-network/sdk-javascript';

import coin from 'assets/images/coin.svg';
import coinsStacked from 'assets/images/coins_stacked.svg';
import discordIcon from 'assets/images/discord.svg';

import { Button, Card, Modal, SmallerDecimal } from 'components';
import { DenomsUtils, I18n, NumbersUtils, WalletUtils } from 'utils';
import { RootState } from 'redux/store';

import './MyPlace.scss';

const MyPlace = () => {
    const { balances, activities, prizeToClaim, prices } = useSelector((state: RootState) => ({
        balances: state.wallet.lumWallet?.balances,
        activities: state.wallet.lumWallet?.activities,
        prizeToClaim: state.wallet.prizeToClaim,
        prices: state.stats.prices,
    }));

    const renderAsset = (asset: LumTypes.Coin) => {
        const icon = DenomsUtils.getIconFromDenom(asset.denom);
        const normalDenom = DenomsUtils.getNormalDenom(asset.denom);
        const amount = NumbersUtils.convertUnitNumber(asset.amount);
        const price = prices?.[normalDenom];

        return (
            <Card flat key={asset.denom} className='asset-card'>
                <div className='d-flex justify-content-between align-items-center'>
                    <div className='d-flex flex-row align-items-center'>
                        {icon ? <img src={icon} alt={`${asset.denom} icon`} className='denom-icon' /> : <div className='denom-unknown-icon'>?</div>}
                        <div className='d-flex flex-column asset-amount'>
                            {numeral(amount).format('0,0')} {normalDenom.toUpperCase()}
                            <small className='p-0'>{price ? numeral(amount * price).format('$0,0.[00]') : '-'}</small>
                        </div>
                    </div>
                    <div className='d-flex flex-row align-items-center'>
                        <Button outline className='me-2' data-bs-toggle='modal' data-bs-target='#withdrawModal'>
                            {I18n.t('myPlace.withdraw')}
                        </Button>
                        <Button>{I18n.t('myPlace.deposit')}</Button>
                    </div>
                </div>
            </Card>
        );
    };

    const totalBalancePrice = balances ? WalletUtils.getTotalBalance(balances, prices) : null;

    return (
        <div className='container'>
            <div className='row'>
                <div className='col-12 col-lg-8 col-xxl-9'>
                    <div>
                        <h2>{I18n.t('myPlace.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div className='my-auto d-flex flex-column justify-content-center'>
                                {totalBalancePrice ? (
                                    <SmallerDecimal big nb={numeral(totalBalancePrice).format('$0,0.[00]')} className='balance-number mt-3' />
                                ) : (
                                    <div className='balance-number'>-</div>
                                )}
                            </div>
                            <img src={coin} className='coin-1' alt='coin' />
                            <img src={coin} className='coin-2' alt='coin' />
                            <img src={coin} className='coin-3' alt='coin' />
                        </Card>
                        <h2 className='mt-4'>{I18n.t('myPlace.assets')}</h2>
                        <Card>
                            {balances && balances.length > 0 ? (
                                balances.map(renderAsset)
                            ) : (
                                <div className='d-flex flex-column align-items-center justify-content-center'>
                                    <img src={coinsStacked} alt='Stacked coins' />
                                    <h3 className='mt-2'>{I18n.t('myPlace.noAssets.title')}</h3>
                                    <p className='text-center'>{I18n.t('myPlace.noAssets.description')}</p>
                                    <Button>{I18n.t('myPlace.deposit')}</Button>
                                </div>
                            )}
                        </Card>
                        {activities && activities.length > 0 ? (
                            <div className='mt-4'>
                                <h2>{I18n.t('myPlace.activities')}</h2>
                                <Card>
                                    <div />
                                </Card>
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className='col-12 col-lg-4 col-xxl-3'>
                    {prizeToClaim ? (
                        <div className='mt-4 mt-lg-0'>
                            <h2>{I18n.t('myPlace.claimPrize')}</h2>
                            <Card>
                                <div className='d-flex flex-column'>
                                    <span className='asset-amount'>
                                        <SmallerDecimal nb={numeral(NumbersUtils.convertUnitNumber(prizeToClaim.amount)).format('0,0.[00]')} className='me-2' />
                                        {DenomsUtils.getNormalDenom(prizeToClaim.denom).toUpperCase()}
                                    </span>
                                    <Button className='my-place-cta'>{I18n.t('myPlace.claim')}</Button>
                                </div>
                            </Card>
                        </div>
                    ) : null}
                    <h2 className={prizeToClaim ? 'mt-4' : 'mt-4 mt-lg-0'}>{I18n.t('myPlace.governance')}</h2>
                    <Card>
                        <h3>{I18n.t('myPlace.governanceCard.title')}</h3>
                        <p>{I18n.t('myPlace.governanceCard.description')}</p>
                        <Button className='my-place-cta'>
                            <img src={discordIcon} alt='Discord' className='me-2' />
                            {I18n.t('myPlace.governanceCard.cta')}
                        </Button>
                    </Card>
                </div>
            </div>
            <Modal id='withdrawModal'>
                <div>Withdraw Modal</div>
            </Modal>
        </div>
    );
};

export default MyPlace;
