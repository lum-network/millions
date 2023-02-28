export default {
    welcome: 'Welcome to Millions',
    connectWallet: 'Connect wallet',
    countDown: {
        days_zero: 'Day',
        days_one: 'Day',
        days_other: 'Days',
        hour_zero: 'Hour',
        hours_one: 'Hour',
        hours_other: 'Hours',
        minutes_zero: 'Min',
        minutes_one: 'Min',
        minutes_other: 'Min',
        seconds_zero: 'Sec',
        seconds_one: 'Sec',
        seconds_other: 'Sec',
    },
    errors: {
        generic: {
            required: '{{ field }} is required',
        },
        keplr: {
            notInstalled: 'Please install keplr extension',
            notLatest: 'Please use an up to date version of the Keplr extension',
            network: 'Failed to connect to the network',
            networkAdd: 'Failed to add network to Keplr',
            wallet: 'Failed to connect to Keplr wallet',
        },
        client: {
            osmosis: 'Error with RPC connection to Osmosis. IBC transactions may not work.',
            lum: 'Error with RPC connection to Lum Network.',
        },
        deposit: {
            lessThanZero: 'Amount must be greater than 0',
            greaterThanBalance: 'Amount must be less than available balance',
            fees: 'Not enough LUM to pay fees',
        },
    },
    home: {
        title: 'Home',
        nextBestPrize: 'Next best prize',
        lastBigWinners: 'Last big winners',
        totalValueLocked: 'Total value locked',
    },
    pools: {
        title: 'Pools',
        totalDeposit: 'Total Deposit',
        tvl: 'TVL:',
        cta: 'Deposit',
        drawEndAt: 'Time left to join:',
    },
    myPlace: {
        title: 'My place',
        assets: 'Assets',
        totalBalance: 'Total balance',
        claim: 'Claim',
        claimPrize: 'Claim prize',
        deposit: 'Deposit',
        withdraw: 'Withdraw',
        activities: 'Activities',
        noAssets: {
            title: 'No assets yet',
            description: 'It’s time to deposit assets in your wallet\nto participate to the next prize',
        },
        governance: 'Governance',
        governanceCard: {
            title: 'Governance card title',
            description: 'Governance card wording description',
            cta: 'Join our Discord',
        },
    },
    withdraw: {
        title: 'Withdraw IBC Asset',
        amountInput: {
            label: 'Select Amount:',
            sublabel: 'Available: {{ amount }} {{ denom }}',
        },
    },
};
