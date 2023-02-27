import React from 'react';

import './Card.scss';

interface IProps {
    children: React.ReactNode;
    className?: string;
    withoutPadding?: string;
}

const Card = ({ children, className, withoutPadding }: IProps) => {
    return <div className={`${withoutPadding ? '' : 'p-3 py-4 p-sm-4 p-xl-5'} app-card ${className}`}>{children}</div>;
};

export default Card;
