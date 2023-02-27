import React from 'react';
import { Button, Card } from 'components';

import { I18n } from 'utils';

import './MyPlace.scss';

const assets = [
    {
        name: 'ATOM',
        amount: 100,
    },
    {
        name: 'EVMOS',
        amount: 100,
    },
    {
        name: 'OSMO',
        amount: 100,
    },
];

const MyPlace = () => {
    return (
        <div className='container'>
            <div className='row'>
                <div className='col-9'>
                    <div>
                        <h2>{I18n.t('myPlace.totalBalance')}</h2>
                        <Card className='balance-card'>
                            <div>18929$</div>
                        </Card>
                    </div>
                </div>
                <div className='col-3'>
                    <h2>{I18n.t('myPlace.claimPrize')}</h2>
                    <Card>
                        <div className='d-flex flex-column'>
                            3600 ATOM
                            <Button>{I18n.t('myPlace.claim')}</Button>
                        </div>
                    </Card>
                </div>
            </div>
            <div className='row mt-5'>
                <div className='col-9'>
                    <h2>{I18n.t('myPlace.assets')}</h2>
                    <Card>
                        {assets.map((asset) => (
                            <Card key={asset.name} className='asset-card'>
                                <div className='d-flex justify-content-between'>
                                    {asset.amount} {asset.name}
                                    <div>
                                        <Button>{I18n.t('myPlace.withdraw')}</Button>
                                        <Button>{I18n.t('myPlace.deposit')}</Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </Card>
                </div>
            </div>
            <div className='row mt-5'>
                <div className='col-9'>
                    <h2>{I18n.t('myPlace.activities')}</h2>
                    <Card>
                        <div />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MyPlace;
