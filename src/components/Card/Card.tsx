import React from 'react';

import './Card.scss';

interface IProps extends React.BaseHTMLAttributes<HTMLDivElement> {
    withoutPadding?: boolean;
    flat?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card = React.forwardRef<HTMLDivElement, IProps>(function Card({ children, className, withoutPadding, flat, onClick, ...rest }, ref) {
    return (
        <div {...rest} ref={ref} className={`${withoutPadding ? '' : 'p-4 p-xl-5'} app-card ${flat && 'flat'} ${className} ${onClick && 'scale-hover'}`} onClick={onClick}>
            {children}
        </div>
    );
});

export default Card;
