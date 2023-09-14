import React from 'react';
import Button from '../Button/Button';
import Assets from 'assets';

import './ArrowButton.scss';

interface IProps {
    onClick: () => void;
    direction: 'left' | 'right';
    className?: string;
}

const ArrowButton = ({ onClick, className, direction }: IProps) => {
    return (
        <Button outline className={`arrow-button d-flex align-items-center justify-content-center direction-${direction} ${className}`} onClick={onClick}>
            <img src={Assets.images.arrow} alt='arrow' />
        </Button>
    );
};

export default ArrowButton;
