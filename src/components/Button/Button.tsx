import React from 'react';
import { Link } from 'react-router-dom';

import { Loading } from '..';

import './Button.scss';

interface IProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    outline?: boolean;
    textOnly?: boolean;
    onClick?: () => void;
    to?: string;
    locationState?: any;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const Button = ({ children, outline, to, textOnly, locationState, disabled, onClick, loading, className, style, ...rest }: IProps) => {
    if (to) {
        return (
            <Link
                to={disabled ? '#' : to}
                type='button'
                state={locationState}
                onClick={
                    !loading && !disabled
                        ? (event) => {
                              event.stopPropagation();
                              onClick?.();
                          }
                        : () => null
                }
                className={`app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : 'app-btn-plain'} ${className}`}
                style={style}
            >
                {loading ? <Loading /> : children}
            </Link>
        );
    }

    return (
        <button
            onClick={
                !loading && !disabled
                    ? (event) => {
                          event.stopPropagation();
                          onClick?.();
                      }
                    : () => null
            }
            className={`app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : textOnly ? 'app-btn-text' : 'app-btn-plain'} ${className}`}
            disabled={disabled}
            {...rest}
        >
            {loading ? <Loading /> : children}
        </button>
    );
};

export default Button;
