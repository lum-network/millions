import React from 'react';

import Assets from 'assets';
import { Card } from 'components';

const PoolCardPlaceholder = ({ name }: { name: string }) => {
    return (
        <Card withoutPadding className='p-3 p-xxl-4 pool-card d-flex flex-column align-items-center'>
            <img width={88} height={88} src={Assets.images.cosmonautCoin} alt='cosmonaut coin' />
            <div className='name-container'>
                <span className='name'>{'soon'}</span>
            </div>
            <div className='prize-container'>
                <p>To be announced</p>
                <h3>{name}</h3>
            </div>
            <Card withoutPadding flat className='prize-card'>
                Estimated Prize
                <p className='mb-0' style={{ filter: 'blur(5px)', color: '#8C8C8C' }}>
                    $00000
                </p>
            </Card>
        </Card>
    );
};

export default PoolCardPlaceholder;
