import React from 'react';

import './Pagination.scss';

interface Props {
    pagination: {
        hasNextPage?: boolean;
        hasPreviousPage?: boolean;
        pagesTotal?: number;
        page?: number;
    };
    onPageChange: (page: number) => void;
    customPagination?: string;
}

const Pagination = ({ pagination, onPageChange, customPagination }: Props) => {
    if (!pagination || !onPageChange) {
        return null;
    }

    const { page, hasPreviousPage, hasNextPage, pagesTotal } = pagination;

    if (page === undefined || pagesTotal === undefined) {
        return null;
    }

    return (
        <div className={`d-flex justify-content-end ${customPagination}`}>
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

export default Pagination;
