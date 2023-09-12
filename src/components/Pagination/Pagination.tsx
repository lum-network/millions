import React from 'react';

import { Breakpoints } from 'constant';
import { useWindowSize } from 'hooks';

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

    const winSizes = useWindowSize();

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
                            {winSizes.width > Breakpoints.SM ? 1 : null} ...
                        </a>
                    </li>
                )}
                {winSizes.width > Breakpoints.MD && hasPreviousPage && page > 2 && (
                    <li className='page-item'>
                        <a onClick={() => onPageChange(page - 1)} className='page-link pointer'>
                            {page - 1}
                        </a>
                    </li>
                )}
                <li className='page-item active' aria-current='page'>
                    <span className='page-link'>{page}</span>
                </li>
                {winSizes.width > Breakpoints.MD && hasNextPage && page + 1 < pagesTotal && (
                    <li className='page-item'>
                        <a onClick={() => onPageChange(page + 1)} className='page-link pointer'>
                            {page + 1}
                        </a>
                    </li>
                )}
                {hasNextPage && page < pagesTotal && (
                    <li className='page-item'>
                        <a onClick={() => onPageChange(pagesTotal)} className='page-link pointer'>
                            ... {winSizes.width > Breakpoints.SM ? pagesTotal : null}
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
