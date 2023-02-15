import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './redux/store';
import Core from 'core';

const App = () => {
    return (
        <Provider store={store}>
            <ToastContainer closeButton={false} />
            <Core />
        </Provider>
    );
};

export default App;
