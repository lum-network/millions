import React from 'react';

import './Button.scss';

interface IProps {
    children: React.ReactNode;
    outline?: boolean;
    onClick?: () => void;
    link?: string;
    disabled?: boolean;
}

const Button = ({ children, outline, link, disabled, onClick }: IProps) => {
    return <button className='app-button'>{children}</button>;
};

export default Button;
