import React from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

import Core from 'core';

import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'react-loading-skeleton/dist/skeleton.css';

import store from './redux/store';

gsap.config({ nullTargetWarn: false });
gsap.registerPlugin(MotionPathPlugin, ScrollTrigger, ScrollToPlugin, CustomEase, SplitText);

ScrollTrigger.normalizeScroll(true);

const App = () => {
    return (
        <Provider store={store}>
            <ToastContainer hideProgressBar closeButton={false} position='bottom-right' />
            <Core />
        </Provider>
    );
};

export default App;
