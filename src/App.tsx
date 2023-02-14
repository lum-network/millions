import React from 'react';
import { Provider } from 'react-redux';

import store from './redux/store';
import Core from 'core';

const App = () => {
    return (
        <Provider store={store}>
            <Core />
        </Provider>
    );
};

export default App;
