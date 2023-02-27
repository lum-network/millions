import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from 'assets/images/logo.svg';
import { Button } from 'components';
import { StringsUtils } from 'utils';
import { RootState } from 'redux/store';

import './Header.scss';

const Header = () => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);

    return (
        <header className='navbar fixed-top p-0'>
            <nav className='container-fluid p-4'>
                <Link to='/'>
                    <img src={logo} />
                </Link>
                <div className='navbar-items-container'>
                    <ul className='nav'>
                        <li>
                            <NavLink to='/home' className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                Home
                            </NavLink>
                        </li>
                        <li className='mx-4'>
                            <NavLink to='/pools' className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                Pools
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to='/my-place' className={({ isActive }) => `navlink ${isActive ? 'active' : ''}`}>
                                My Place
                            </NavLink>
                        </li>
                        <li className='ms-4'>
                            <Button outline>{address ? StringsUtils.trunc(address) : 'Connect Wallet'} </Button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
