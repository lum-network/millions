import React from 'react';
import { Link } from 'react-router-dom';

import { Loading } from '..';

import './Button.scss';

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    outline?: boolean;
    onClick?: () => void;
    to?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const Button = ({ children, outline, to, disabled, onClick, loading, className, ...rest }: IProps) => {
    if (to) {
        return (
            <Link to={to} onClick={!loading ? onClick : () => null} className={`app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : 'app-btn-plain'} ${className}`}>
                {loading ? <Loading /> : children}
            </Link>
        );
    }

    return (
        <button onClick={!loading ? onClick : () => null} className={`app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : 'app-btn-plain'} ${className}`} {...rest}>
            {loading ? <Loading /> : children}
        </button>
    );
};

export default Button;
