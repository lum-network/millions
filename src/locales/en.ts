export default {
    welcome: 'Welcome to Millions',
    pools: 'Pools',
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
};
