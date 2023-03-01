import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import Core from 'core';

import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';

import store from './redux/store';

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, CustomEase);

const App = () => {
    return (
        <Provider store={store}>
            <ToastContainer hideProgressBar closeButton={false} position='bottom-right' />
            <Core />
        </Provider>
    );
};

export default App;
