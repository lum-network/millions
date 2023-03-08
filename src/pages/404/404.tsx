import React from 'react';

import warningIcon from 'assets/images/warning.svg';
import { I18n } from 'utils';

import './404.scss';

const Error404 = () => {
    return (
        <div className='error-404 d-flex flex-column align-items-center justify-content-center h-100'>
            <img src={warningIcon} />
            <h2 className='my-4'>{I18n.t('errors.404.title')}</h2>
            <h3>{I18n.t('errors.404.description')}</h3>
        </div>
    );
};

export default Error404;
