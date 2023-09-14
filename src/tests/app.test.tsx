import React from 'react';

import { render, screen } from '@testing-library/react';
import App from 'App';
import { HomePage, LandingPage, MySavingsPage, PoolsPage, Winners } from 'pages';
import { renderWithRematchStore } from 'utils/tests';
import store from 'redux/store';
import { MemoryRouter } from 'react-router-dom';
import { LumWalletFactory } from '@lum-network/sdk-javascript';
import { I18n } from 'utils';

jest.setTimeout(180000);

describe('App', () => {
    it('renders without crashing', async () => {
        render(<App />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toBeInTheDocument();
    });

    it('render the Landing Page without crashing', () => {
        // Render Landing page
        renderWithRematchStore(
            <MemoryRouter>
                <LandingPage />
            </MemoryRouter>,
            store,
        );

        // Check that saving cta is there
        const savingCta = screen.getByText(I18n.t('landing.saving.cta'));
        expect(savingCta).toBeInTheDocument();
    });

    it('render the Home Page without crashing', () => {
        renderWithRematchStore(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
            store,
        );

        // Check that deposit cta is there
        const savingCta = screen.getByText(I18n.t('home.cta'));
        expect(savingCta).toBeInTheDocument();
    });

    it('render the Pools Page without crashing', () => {
        renderWithRematchStore(
            <MemoryRouter>
                <PoolsPage />
            </MemoryRouter>,
            store,
        );

        // Check that section title is there
        const sectionTitle = screen.getByText(I18n.t('pools.title'));
        expect(sectionTitle).toBeInTheDocument();
    });

    it('render the Winners Page without crashing', () => {
        renderWithRematchStore(
            <MemoryRouter>
                <Winners />
            </MemoryRouter>,
            store,
        );

        // Check that section title is there
        const sectionTitle = screen.getByText(I18n.t('luckiestWinners.title'));
        expect(sectionTitle).toBeInTheDocument();
    });

    it('render the My Savings Page without crashing', async () => {
        // Log in using a test wallet to enable My Savings page
        const testMnemonic = 'silver section assault success awesome arrest close problem trick robot loop fluid';
        const testWallet = await LumWalletFactory.fromMnemonic(testMnemonic);

        store.dispatch.wallet.signInLum(testWallet);
        store.dispatch.wallet.setLumWalletData({
            balances: [],
            activities: {
                result: [],
                currentPage: 1,
                pagesTotal: 1,
                pagesLoaded: 1,
            },
            deposits: [],
            prizes: [],
        });

        // Render My Savings page
        renderWithRematchStore(
            <MemoryRouter>
                <MySavingsPage />
            </MemoryRouter>,
            store,
        );

        // Check that balance title is there
        const balanceTitle = screen.getByText(I18n.t('mySavings.totalBalance'));
        expect(balanceTitle).toBeInTheDocument();
    });
});
