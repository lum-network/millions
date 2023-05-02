import React from 'react';

import './Table.scss';

interface Props {
    children: React.ReactNode;
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
const Table = ({ children, className, pagination, onPageChange, customPagination, responsive = true }: Props) => {
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
                    {hasPreviousPage && (
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
                    {hasNextPage && page < pagesTotal - 2 && (
                        <li className='page-item'>
                            <a onClick={() => onPageChange(pagesTotal - 1)} className='page-link pointer'>
                                ... {pagesTotal - 1}
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

    return (
        <>
            <div className={`${responsive ? 'table-responsive' : ''} ${className}`}>
                <table className='table table-borderless mb-0'>
                    <tbody>{children}</tbody>
                </table>
            </div>
            {renderPagination()}
        </>
    );
};

export default Table;
