import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import 'normalize.css';
import '@popperjs/core';
import 'bootstrap';
import './styles/_main.scss';

if (process.env.REACT_APP_SENTRY_DSN !== undefined && process.env.REACT_APP_SENTRY_DSN !== null) {
    Sentry.init({
        dsn: process.env.REACT_APP_SENTRY_DSN,
        integrations: [new BrowserTracing()],
        tracesSampleRate: 1.0,
    });
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
