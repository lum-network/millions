import React from 'react';

import Assets from 'assets';
import { I18n } from 'utils';

import Card from '../Card/Card';
import Tooltip from '../Tooltip/Tooltip';
import './TransactionBatchProgress.scss';

interface Props {
    batch: number;
    batchTotal: number;
    className?: string;
}

const ProgressCard = ({ batch, batchTotal, className }: Props) => {
    return (
        <Card flat withoutPadding className={`d-flex flex-row justify-content-center progress-card ${className}`}>
            <div className='card-progress' style={{ width: `calc(${(batch / batchTotal) * 100}% + 4px)` }} />
            <span data-tooltip-id='batch-tooltip' data-tooltip-html={I18n.t('depositDrops.depositFlow.batchTooltip')} className='me-2'>
                <img className='batch-card-info-icon' src={Assets.images.info} alt='info' />
                <Tooltip id='batch-tooltip' delay={2000} />
            </span>
            <div style={{ zIndex: 2 }}>{I18n.t('depositDrops.depositFlow.batch', { count: batch, total: batchTotal })}</div>
        </Card>
    );
};

export default ProgressCard;
