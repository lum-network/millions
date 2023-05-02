import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { NumbersUtils } from 'utils';

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
    isLoading?: boolean;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const AmountInput = (props: Props) => {
    const { onMax, label, sublabel, className, error, inputClassName, inputProps, price, isLoading } = props;
    const [usdValue, setUsdValue] = useState<number | null>(null);

    useEffect(() => {
        const valueToNumber = Number(inputProps?.value);
        if (price && inputProps?.value && !Number.isNaN(valueToNumber)) {
            setUsdValue(valueToNumber * price);
        } else {
            setUsdValue(null);
        }
    }, [inputProps?.value, price]);

    return (
        <div className={`amount-input ${className}`}>
            {label || sublabel ? (
                <div className='labels-container mb-2 text-start'>
                    {label ? <label className='label'>{label}</label> : null}
                    {sublabel ? <label className='sublabel'>{sublabel}</label> : null}
                </div>
            ) : null}
            {isLoading ? (
                <Skeleton height={60} />
            ) : (
                <div className={`amount-input-container px-4 ${usdValue ? 'py-2' : 'py-3'}`}>
                    <div className='input-container d-flex flex-column'>
                        <input className={`default-input p-0 ${inputClassName}`} {...inputProps} />
                        {usdValue ? <p className='price-label mb-0 text-start'>${NumbersUtils.formatTo6digit(usdValue)}</p> : null}
                    </div>
                    {onMax ? (
                        <Button type='button' outline className='max-btn rounded-pill py-1 px-3 ms-2' onClick={onMax}>
                            MAX
                        </Button>
                    ) : null}
                </div>
            )}
            {error ? <p className='text-danger text-start mt-2'>{error}</p> : null}
        </div>
    );
};

export default AmountInput;
