import { Header } from 'components';
import React from 'react';

import './MainLayout.scss';

interface IProps {
    children: React.ReactNode;
}

const MainLayout = ({ children }: IProps) => {
    return (
        <div className='main-layout'>
            <div className='container fill'>
                <Header />
                <main className='h-100'>{children}</main>
            </div>
        </div>
    );
};

export default MainLayout;
