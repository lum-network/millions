import React from 'react';

import './Card.scss';

interface IProps {
    children: React.ReactNode;
}

const Card = ({ children }: IProps) => {
    return <div className='card'>{children}</div>;
};

export default Card;
