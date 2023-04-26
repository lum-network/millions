import React from 'react';
import './SmallerDecimal.scss';

interface IProps {
    className?: string;
    nb: string;
    big?: boolean;
    fontSize?: number;
}

const SmallerDecimal = ({ nb, big, className, fontSize }: IProps): JSX.Element => {
    const split = nb.split('.');

    if (split.length > 1) {
        return (
            <span className={`${big ? 'smaller-decimal-big' : 'smaller-decimal'} ${className}`} style={fontSize ? { fontSize: `${fontSize}px` } : undefined}>
                {split[0]}
                <small>.{split[1]}</small>
            </span>
        );
    }

    return big ? <h1 className={`display-6 fw-normal ${className}`}>{nb}</h1> : <span className={className}>{nb}</span>;
};

export default SmallerDecimal;
