import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import './Tooltip.scss';

const Tooltip = ({ id, delay }: { id: string; delay?: number }) => {
    return <ReactTooltip id={id} clickable className='tooltip-light app-tooltip width-400' variant='light' delayHide={delay} />;
};

export default Tooltip;
