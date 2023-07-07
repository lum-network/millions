import React from 'react';
import { Button, Card } from 'components';
import { I18n, KeplrUtils } from 'utils';
import Assets from 'assets';
import { NavigationConstants } from 'constant';
import { useSelector } from 'react-redux';
import { RootState } from 'redux/store';

import './DepositDropsCard.scss';

interface IProps {
    cta: string;
    link: string;
    className?: string;
}

const DepositDropsCard = ({ className, cta, link }: IProps): JSX.Element => {
    const lumWallet = useSelector((state: RootState) => state.wallet.lumWallet);

    return (
        <Card withoutPadding className={`${className} drops-card p-xl-3 p-4`}>
            <div className='d-flex flex-column flex-xl-row align-items-center'>
                <img alt='cosmonaut flying' className='me-5 cosmonaut-flying' src={Assets.images.cosmonautFlying} />
                <div>
                    <h2>{I18n.t('depositDrops.card.title')}</h2>
                    <p
                        className='drops-description'
                        dangerouslySetInnerHTML={{
                            __html: I18n.t('depositDrops.card.description', {
                                link: NavigationConstants.DOCUMENTATION_DROPS,
                            }),
                        }}
                    />
                </div>
                <Button
                    disabled={KeplrUtils.isKeplrInstalled() && lumWallet === null}
                    {...(!KeplrUtils.isKeplrInstalled()
                        ? {
                              'data-bs-target': '#get-keplr-modal',
                              'data-bs-toggle': 'modal',
                          }
                        : {
                              to: link,
                          })}
                    className='ms-5 me-3 cta-drops'
                >
                    {cta}
                </Button>
            </div>
        </Card>
    );
};

export default DepositDropsCard;
