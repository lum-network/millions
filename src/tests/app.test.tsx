import React from 'react';

import { LumWalletFactory } from '@lum-network/sdk-javascript';
import { PoolState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/pool';
import { DrawState } from '@lum-network/sdk-javascript/build/codec/lum/network/millions/draw';
import { act, render, screen } from '@testing-library/react';
import { MemoryRouter, RouterProvider, createMemoryRouter } from 'react-router-dom';
import Long from 'long';

import App from 'App';
import { DepositPage, HomePage, LandingPage, MySavingsPage, PoolDetailsPage, PoolsPage, Winners } from 'pages';
import store from 'redux/store';
import { DenomsUtils, I18n } from 'utils';
import { renderWithRematchStore } from 'utils/tests';
import { PoolModel } from 'models';

jest.setTimeout(180000);

describe('App', () => {
    const testMnemonic = 'silver section assault success awesome arrest close problem trick robot loop fluid';
    const testPool: PoolModel = {
        poolId: Long.fromNumber(2),
        denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
        nativeDenom: 'uatom',
        chainId: 'gaia-devnet',
        connectionId: 'connection-0',
        transferChannelId: 'channel-0',
        icaDepositPortId: 'pool.2.deposit',
        icaPrizepoolPortId: 'pool.2.prizepool',
        validators: [],
        bech32PrefixAccAddr: 'cosmos',
        bech32PrefixValAddr: 'cosmosvaloper',
        minDepositAmount: '1000000',
        currentPrizeToWin: {
            denom: 'atom',
            amount: 0,
        },
        estimatedPrizeToWin: {
            denom: 'atom',
            amount: 0,
        },
        apy: 0,
        localAddress: '',
        icaDepositAddress: '',
        icaPrizepoolAddress: '',
        nextDrawId: Long.fromNumber(1),
        tvlAmount: '100000',
        depositorsCount: Long.fromNumber(0),
        sponsorshipAmount: '0',
        state: PoolState.POOL_STATE_READY,
        lastDrawState: DrawState.DRAW_STATE_UNSPECIFIED,
        createdAtHeight: Long.fromNumber(0),
        updatedAtHeight: Long.fromNumber(0),
        leaderboard: {
            items: [],
            page: 0,
            fullyLoaded: false,
        },
    };

    it('loads without crashing', async () => {
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

    it('render the Pool Details page without crashing', () => {
        const router = createMemoryRouter(
            [
                {
                    path: '/pools/details/:denom',
                    element: <PoolDetailsPage />,
                },
            ],
            {
                initialEntries: ['/pools/details/atom'],
            },
        );

        // Dispatch new pool in store
        store.dispatch.pools.setPools([testPool]);

        renderWithRematchStore(<RouterProvider router={router} />, store);

        const poolDetailPageTitle = screen.getByText(`${DenomsUtils.getNormalDenom(testPool.nativeDenom).toUpperCase()} ${I18n.t('common.pool')}`);
        expect(poolDetailPageTitle).toBeInTheDocument();
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
        const testWallet = await LumWalletFactory.fromMnemonic(testMnemonic);

        store.dispatch.wallet.signInLum(testWallet);

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

    it('render the Deposit flow without crashing', async () => {
        const router = createMemoryRouter(
            [
                {
                    path: '/pools/:denom',
                    element: <DepositPage />,
                },
                {
                    path: '/pools/:denom/:poolId',
                    element: <DepositPage />,
                },
            ],
            {
                initialEntries: ['/pools/atom'],
            },
        );

        // Dispatch new pool in store
        store.dispatch.pools.setPools([testPool]);

        // Render Deposit page
        renderWithRematchStore(<RouterProvider router={router} />, store);

        const transferBtn = screen.getByText(I18n.t('deposit.transferBtn'));

        expect(transferBtn).toBeInTheDocument();
        expect(transferBtn.parentElement).toBeDisabled();

        const testWallet = await LumWalletFactory.fromMnemonic(testMnemonic);

        // Fake log in to enable the transfer button
        act(() => {
            store.dispatch.wallet.signInLum(testWallet);
            store.dispatch.wallet.setOtherWalletData({
                denom: 'atom',
                balances: [],
                address: 'cosmos1fx8cemme5fapdrcuqzk47dqj0yehu4p9yq9w66',
            });
        });

        expect(transferBtn.parentElement).toBeEnabled();
    });
});
