import React from 'react';

import './Card.scss';

interface IProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    withoutPadding?: boolean;
    flat?: boolean;
    onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Card = ({ children, className, withoutPadding, flat, onClick, ...rest }: IProps) => {
    return (
        <div className={`${withoutPadding ? '' : 'p-4 p-xl-5'} app-card ${flat && 'flat'} ${className} ${onClick && 'scale-hover'}`} onClick={onClick} {...rest}>
            {children}
        </div>
    );
};

export default Card;
