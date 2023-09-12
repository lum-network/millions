import React from 'react';

import { act, render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import App from 'App';
import { HomePage, LandingPage, MySavingsPage, PoolsPage, Winners } from 'pages';
import { renderWithRematchStore } from 'utils/tests';
import store from 'redux/store';
import Core from 'core';
import { MemoryRouter, RouterProvider } from 'react-router-dom';
import { router } from 'navigation';

jest.setTimeout(180000);

describe('App', () => {
    /* it('renders without crashing', async () => {
        //renderWithRematchStore(<RouterProvider router={router} />, store);
        render(<App />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();

        await waitFor(() => expect(progressBar.classList.contains('slow-hide')).toBeTruthy(), { timeout: 150000 });
        screen.debug();
    });
 */
    it('render the Landing Page without crashing', () => {
        renderWithRematchStore(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>,
            store,
        );

        screen.debug();
    });
});
