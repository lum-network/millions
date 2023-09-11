import React from 'react';

import './PurpleBackgroundImage.scss';

const PurpleBackgroundImage = (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} className={`purple-image ${props.className}`} />;
};

export default PurpleBackgroundImage;
