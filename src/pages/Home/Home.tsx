import React from 'react';
import { I18n } from 'utils';

import './Home.scss';

const Home = () => {
    return (
        <div>
            <h1>{I18n.t('welcome')}</h1>
        </div>
    );
};

export default Home;
