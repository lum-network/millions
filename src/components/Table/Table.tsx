import React from 'react';

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
}
const Table = ({ children, customPagination, className, pagination, onPageChange, headers, responsive = true }: Props) => {
    const renderPagination = () => {
        if (!pagination || !onPageChange) {
            return null;
        }

        const { page, hasPreviousPage, hasNextPage, pagesTotal } = pagination;

        if (page === undefined || pagesTotal === undefined) {
            return null;
        }

        return (
            <div className={`pe-3 d-flex justify-content-end ${customPagination}`}>
                <ul className='pagination'>
                    <li className={`page-item ${hasPreviousPage ? 'active without-border' : 'disabled'}`}>
                        <a onClick={() => onPageChange(page - 1)} className='page-link pointer'>
                            {'<'}
                        </a>
                    </li>
                    {hasPreviousPage && page > 1 && (
                        <li className='page-item'>
                            <a onClick={() => onPageChange(1)} className='page-link pointer'>
                                1 ...
                            </a>
                        </li>
                    )}
                    {hasPreviousPage && page > 2 && (
                        <li className='page-item'>
                            <a onClick={() => onPageChange(page - 1)} className='page-link pointer'>
                                {page - 1}
                            </a>
                        </li>
                    )}
                    <li className='page-item active' aria-current='page'>
                        <span className='page-link'>{page}</span>
                    </li>
                    {hasNextPage && (
                        <li className='page-item'>
                            <a onClick={() => onPageChange(page + 1)} className='page-link pointer'>
                                {page + 1}
                            </a>
                        </li>
                    )}
                    {hasNextPage && page < pagesTotal - 1 && (
                        <li className='page-item'>
                            <a onClick={() => onPageChange(pagesTotal)} className='page-link pointer'>
                                ... {pagesTotal}
                            </a>
                        </li>
                    )}
                    <li className={`page-item ${hasNextPage ? 'active without-border' : 'disabled'}`}>
                        <a onClick={() => onPageChange(page + 1)} className='page-link pointer'>
                            {'>'}
                        </a>
                    </li>
                </ul>
            </div>
        );
    };

    const limitLeft = headers ? headers.length / 2 : 0;

    return (
        <>
            <div className={`${responsive ? 'table-responsive' : ''} ${className}`}>
                <table className='table table-borderless mb-0'>
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
            {renderPagination()}
        </>
    );
};

export default Table;
