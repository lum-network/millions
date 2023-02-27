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
        minutes_zero: 'Minute',
        minutes_one: 'Minute',
        minutes_other: 'Minutes',
        seconds_zero: 'Second',
        seconds_one: 'Second',
        seconds_other: 'Seconds',
    },
    errors: {
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
    },
    pools: {
        title: 'Pools',
        totalDeposit: 'Total Deposit',
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
    },
};
