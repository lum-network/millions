import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from 'assets/images/logo.svg';
import { Button } from 'components';
import { I18n, StringsUtils } from 'utils';
import { RootState } from 'redux/store';
import { NavigationConstants } from 'constant';

import './Header.scss';

const Header = () => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);

    return (
        <header className='navbar fixed-top p-0'>
            <nav className='container-fluid p-4 d-flex align-items-center'>
                <Link to='/'>
                    <img src={logo} alt='Cosmos Millions logo' />
                </Link>
                <div className='navbar-items-container'>
                    <ul className='nav d-flex align-items-center'>
                        <li>
                            <NavLink to={NavigationConstants.HOME} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                {I18n.t('home.title')}
                            </NavLink>
                        </li>
                        <li className='mx-lg-5 mx-4'>
                            <NavLink to={NavigationConstants.POOLS} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                {I18n.t('pools.title')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to={NavigationConstants.MY_PLACE} className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                {I18n.t('myPlace.title')}
                            </NavLink>
                        </li>
                        <li className='ms-lg-5 ms-4'>
                            <Button outline>{address ? StringsUtils.trunc(address) : I18n.t('connectWallet')}</Button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
