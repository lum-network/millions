import React from 'react';

import Button from '../Button/Button';

import './AmountInput.scss';

interface Props {
    onMax?: () => void;
    label?: string;
    sublabel?: string;
    placeholder?: string;
    price?: number;
    className?: string;
    inputClassName?: string;
    error?: string;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const AmountInput = (props: Props) => {
    const { onMax, label, sublabel, className, error, inputClassName, inputProps } = props;

    return (
        <div className={`amount-input ${className}`}>
            {label || sublabel ? (
                <div className='labels-container mb-2'>
                    {label ? <label className='label'>{label}</label> : null}
                    {sublabel ? <label className='sublabel'>{sublabel}</label> : null}
                </div>
            ) : null}
            <div className='input-container'>
                <input className={`default-input ${inputClassName}`} {...inputProps} />
                {onMax ? (
                    <Button outline className='max-btn rounded-pill py-1 px-3 ms-2' onClick={onMax}>
                        MAX
                    </Button>
                ) : null}
            </div>
            {error ? <p className='text-danger text-start mt-2'>{error}</p> : null}
        </div>
    );
};

export default AmountInput;
