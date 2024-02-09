import React from 'react';

import './PurpleBackgroundImage.scss';

const PurpleBackgroundImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img alt='purple' {...props} style={{ height: props.height, width: props.width, minHeight: props.height, minWidth: props.width }} className={`purple-image ${props.className}`} />;
};

export default PurpleBackgroundImage;
