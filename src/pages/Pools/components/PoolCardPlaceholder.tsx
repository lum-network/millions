import Assets from 'assets';
import { Card } from 'components';
import React from 'react';

const PoolCardPlaceholder = () => {
    return (
        <Card className='pool-card-container pool-card-placeholder'>
            <img width={88} height={88} src={Assets.images.cosmonautCoin} alt='cosmonaut coin' />
            <div className='name-container'>
                <span className='name'>{'soon'}</span>
            </div>
            <div className='prize-container'>
                <p>To be announced</p>
                <h3>Mad Scientist ?</h3>
            </div>
            <div className='w-100'>
                <Card flat withoutPadding className='prize-to-win'>
                    <div className='d-flex flex-row justify-content-between align-items-center px-4 py-3'>
                        Prize to Win
                        <p className='mb-0' style={{ filter: 'blur(5px)', color: '#8C8C8C' }}>
                            $00
                        </p>
                    </div>
                </Card>
            </div>
        </Card>
    );
};

export default PoolCardPlaceholder;
