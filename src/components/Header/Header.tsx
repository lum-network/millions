import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import logo from 'assets/images/logo.svg';
import { RootState } from 'redux/store';
import { Button } from 'components';

import './Header.scss';

const Header = () => {
    const address = useSelector((state: RootState) => state.wallet.lumWallet?.address);

    return (
        <header className='navbar fixed-top p-0'>
            <div className='background' />
            <nav className='container-fluid p-4'>
                <Link to='/'>
                    <img src={logo} />
                </Link>
                <div className='navbar-items-container'>
                    <ul className='nav'>
                        <li>
                            <Button>Home</Button>
                        </li>
                        <li className='mx-4'>
                            <Button>Pools</Button>
                        </li>
                        <li>
                            <Button>My Place</Button>
                        </li>
                        <li className='ms-4'>
                            <Button>{address || 'Connect Wallet'} </Button>
                        </li>
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;
