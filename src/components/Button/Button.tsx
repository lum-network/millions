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
    forcePurple?: boolean;
}

const Button = ({ children, outline, to, textOnly, locationState, disabled, onClick, loading, className, style, forcePurple, ...rest }: IProps) => {
    const commonProps = {
        onClick:
            !loading && !disabled
                ? (event: React.MouseEvent<HTMLAnchorElement, MouseEvent> | React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                      event.stopPropagation();
                      onClick?.();
                  }
                : () => null,
        className: `app-btn ${disabled ? 'disabled' : ''} ${outline ? 'app-btn-outline' : textOnly ? 'app-btn-text' : 'app-btn-plain'} ${forcePurple ? 'purple-btn' : ''} ${className}`,
    };
    if (to) {
        return (
            <Link {...commonProps} to={disabled ? '#' : to} type='button' state={locationState} style={style}>
                {loading ? <Loading /> : children}
            </Link>
        );
    }

    return (
        <button {...commonProps} disabled={disabled} style={style} {...rest}>
            {loading ? <Loading /> : children}
        </button>
    );
};

export default Button;
