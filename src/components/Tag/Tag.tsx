import React from 'react';

import { TagsConstants } from 'constant';
import { I18n } from 'utils';
import Assets from 'assets';
import { Tooltip } from '../index';

import './Tag.scss';

interface IProps {
    type: TagsConstants.Types;
}

const Tag = ({ type }: IProps) => {
    let classNameType = '';
    let wordType = '';

    switch (type) {
        case TagsConstants.Types.CLAIMED:
            classNameType = 'success';
            wordType = I18n.t('tags.claimed');
            break;
        case TagsConstants.Types.EXPIRED:
            classNameType = 'info';
            wordType = I18n.t('tags.expired');
            break;
        case TagsConstants.Types.UNCLAIMED:
            classNameType = 'outline';
            wordType = I18n.t('tags.unclaimed');
            break;
    }

    return (
        <div className={`tag rounded-pill ${classNameType}`}>
            {wordType}
            {type === TagsConstants.Types.EXPIRED && (
                <span data-tooltip-id='expired-tag' data-tooltip-html={I18n.t('tags.expiredTooltip')} className='ms-2 mb-1'>
                    <img src={Assets.images.infoWhite} alt='info' width={15} height={15} />
                    <Tooltip id='expired-tag' />
                </span>
            )}
        </div>
    );
};

export default Tag;
