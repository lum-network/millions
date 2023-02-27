import React from 'react';

import './Button.scss';
import { Loading } from '..';

interface IProps {
    children: React.ReactNode;
    outline?: boolean;
    onClick?: () => void;
    to?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const Button = ({ children, outline, to, disabled, onClick, loading, className }: IProps) => {
    return (
        <div onClick={!loading ? onClick : () => null} className={`app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : 'app-btn-plain'} ${className}`}>
            {loading ? <Loading /> : children}
        </div>
    );
};

export default Button;
