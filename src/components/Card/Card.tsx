import React from 'react';

import './Card.scss';

interface IProps {
    children: React.ReactNode;
    className?: string;
    withoutPadding?: boolean;
    flat?: boolean;
}

const Card = ({ children, className, withoutPadding, flat }: IProps) => {
    return <div className={`${withoutPadding ? '' : 'p-3 py-4 p-sm-4 p-xl-5'} app-card ${flat && 'flat'} ${className}`}>{children}</div>;
};

export default Card;
