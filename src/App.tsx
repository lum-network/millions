import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './redux/store';
import Core from 'core';

const App = () => {
    return (
        <Provider store={store}>
            <ToastContainer hideProgressBar closeButton={false} position='bottom-right' />
            <Core />
        </Provider>
    );
};

export default App;
