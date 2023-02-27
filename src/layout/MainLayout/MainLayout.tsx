import React from 'react';

import './MainLayout.scss';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='main-layout'>
            <nav>Navigation bar</nav>
            <main>{children}</main>
        </div>
    );
};

export default MainLayout;
