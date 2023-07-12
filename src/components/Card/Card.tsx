import React from 'react';

import './Card.scss';

interface IProps extends React.BaseHTMLAttributes<HTMLDivElement> {
    withoutPadding?: boolean;
    flat?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card = ({ children, className, withoutPadding, flat, onClick, ...rest }: IProps) => {
    return (
        <div {...rest} className={`${withoutPadding ? '' : 'p-4 p-xl-5'} app-card ${flat && 'flat'} ${className} ${onClick && 'scale-hover'}`} onClick={onClick}>
            {children}
        </div>
    );
};

export default Card;
