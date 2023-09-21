import React from 'react';
import { PlacesType, Tooltip as ReactTooltip } from 'react-tooltip';

import './Tooltip.scss';

const Tooltip = ({ id, delay, place }: { id: string; delay?: number; place?: PlacesType }) => {
    return <ReactTooltip id={id} clickable className='tooltip-light app-tooltip width-400' place={place} variant='light' delayHide={delay} />;
};

export default Tooltip;
