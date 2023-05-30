import React from 'react';
import { I18n } from 'utils';

const Loading = (): JSX.Element => {
    return (
        <div className='d-flex justify-content-center align-items-center'>
            <div className='spinner-grow' role='status'>
                <span className='visually-hidden'>{I18n.t('common.loading')}</span>
            </div>
        </div>
    );
};

export default Loading;
