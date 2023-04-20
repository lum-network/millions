import React from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import './Tooltip.scss';

const Tooltip = ({ id }: { id: string }) => {
    return <ReactTooltip id={id} clickable className='tooltip-light app-tooltip width-400' variant='light' delayHide={5000} />;
};

export default Tooltip;
