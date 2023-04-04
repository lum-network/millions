import React from 'react';

import './Table.scss';

const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    return (
        <div className={`table-responsive ${className}`}>
            <table className='table table-borderless mb-0'>
                <tbody>{children}</tbody>
            </table>
        </div>
    );
};

export default Table;
