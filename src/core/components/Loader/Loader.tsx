import React from 'react';

import { Lottie, ProgressBar } from 'components';
import logo from 'assets/lotties/logo.json';

import './Loader.scss';

const Loader = ({ progress, loading }: { progress: number; loading: boolean }): JSX.Element => {
    return (
        <div id='loader' className={`d-flex align-items-center justify-content-center ${!loading ? 'slow-hide' : ''}`}>
            <div className='d-flex align-items-center flex-column text-center' style={{ marginTop: '-5%' }}>
                <Lottie
                    className='logo'
                    animationData={logo}
                    segments={[
                        [0, 41],
                        [41, 257],
                    ]}
                />
                <ProgressBar progress={progress} containerClassName='loading-bar-container' />
            </div>
        </div>
    );
};

export default Loader;
