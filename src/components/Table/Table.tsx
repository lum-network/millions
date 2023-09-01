import React from 'react';

import Pagination from '../Pagination/Pagination';

import './Table.scss';

interface Props {
    children: React.ReactNode;
    headers?: string[];
    className?: string;
    responsive?: boolean;
    pagination?: {
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
        pagesTotal?: number;
        page?: number;
    };
    customPagination?: string;
    onPageChange?: (page: number) => void;
    smallPadding?: boolean;
}
const Table = ({ children, customPagination, className, pagination, onPageChange, headers, smallPadding, responsive = true }: Props) => {
    const limitLeft = headers ? headers.length / 2 : 0;

    return (
        <>
            <div className={`${responsive ? 'table-responsive' : ''} ${className}`}>
                <table className={`table table-borderless mb-0 ${smallPadding ? 'small-padding' : null}`}>
                    {headers && (
                        <thead>
                            <tr>
                                {headers.map((value, index) => (
                                    <th className={limitLeft <= index ? 'p-0 text-nowrap text-end' : 'p-0 text-nowrap'} key={index}>
                                        {value}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    <tbody>{children}</tbody>
                </table>
            </div>
            {pagination && onPageChange && <Pagination pagination={pagination} customPagination={customPagination} onPageChange={onPageChange} />}
        </>
    );
};

export default Table;
