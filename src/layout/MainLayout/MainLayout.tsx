import { Header } from 'components';
import React from 'react';

import './MainLayout.scss';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='main-layout'>
            <Header />
            <main className='dot-bg'>{children}</main>
        </div>
    );
};

export default MainLayout;
