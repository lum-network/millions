import React from 'react';

import './Table.scss';

const Table = ({ children, className, responsive = true }: { children: React.ReactNode; className?: string; responsive?: boolean }) => {
    return (
        <div className={`${responsive ? 'table-responsive' : ''} ${className}`}>
            <table className='table table-borderless mb-0'>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
};

export default Table;
