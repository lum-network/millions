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
    landing: {
        howItWorks: 'How it works',
        documentation: 'Documentation',
        faq: 'FAQ',
        openTheApp: 'Open the app',
        saving: {
            title: 'Win Big by\nSaving Smart',
            p1: 'Introducing Cosmos Millions, a decentralized finance protocol and open-source platform for prize savings.',
            p2: 'The prize-linked savings account with the highest returns ever made.',
            cta: 'Earn by saving',
            biggestPrizeToWin: 'Biggest prize to win',
        },
        cosmosGame: {
            title: 'Time to Spice Up\nthe Cosmos Game!',
            p1: "That's one small step for Cosmonauts, one giant leap for Cosmos.",
            // eslint-disable-next-line max-len
            p2: 'Speed up your path to financial tranquility with our thrilling prize-linked savings accounts! Save your assets in our protocol and random winners will receive prizes from the entire community at each draw.',
            p3: 'With no risk and exciting rewards, bring your savings to the moon!',
        },
        winners: {
            title: 'One Winner, No Losers!',
            p1: 'Deposit\nyour assets',
            p2: 'You’re eligible to all the next\nprizes automatically ',
            p3: 'You win! Auto-compound your prize to boost your chances of earning more next time!',
            p4: 'No win this time, but no loss either! Get ready for another chance next week!',
            or: 'OR',
        },
        pools: {
            title: 'Pools Available',
            deposited: 'Deposited',
            prizeToWin: 'Prize to win',
            newPool: 'Suggest a new pool',
            tvl: 'Total Value Locked',
            cta: 'See all pools',
        },
        future: {
            title: 'The Future of Savings\nwith Cosmos Millions',
            // eslint-disable-next-line max-len
            p1: 'The utilization of Cosmos technology (Cosmos-SDK, Tendermint BFT, IBC, ICA) for Prize Linked Savings overthrows the savings methods in history. The use of sovereign and interoperable network of blockchains allows easy access with minimal fees, making it a standout in the blockchain industry and another confirmation of the limitless potential of the Interchain of Blockchains.',
            p2: 'With an open-source and audited protocol ensuring that prizes are distributed fairly, saving money has never been so rewarding!',
            cta: 'Want to retire in style?',
        },
        community: {
            title: 'Join the Cosmos\nMillions Community',
        },
    },
    home: {
        title: 'Home',
        nextBestPrize: 'Next best prize',
        lastBigWinners: 'Last big winners',
        totalValueLocked: 'Total value locked',
        cta: 'SAVE & WIN',
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
    deposit: {
        title: 'Few steps away\nfrom your deposit',
        depositBtn: 'Deposit',
        saveAndWinBtn: 'Save & Win',
        chancesHint: {
            winning: {
                title: 'Winning chances',
                hint: 'Winning chances hint',
            },
            averagePrize: {
                title: 'Average prize',
                hint: 'Average prize hint',
            },
        },
        feesWarning: 'You will need LUM to pay transaction fees',
        steps: [
            {
                title: 'Transfer {{ denom }} to Lum Network',
                subtitle: 'Transfer your {{ denom }} from {{ chainName }} to Lum Network',
            },
            {
                title: 'Deposit in the {{ denom }} pool',
                subtitle: 'Deposit your {{ denom }} in the pool to participate to the next prize',
            },
            {
                title: 'Saving review & share!',
                subtitle: 'By sharing Cosmos Millions with your friends you can contribute to the community and increase the collective prize pool.',
                cardTitle: 'Your saving review',
                cardSubtitle: 'Congrats 🎉 All upcoming draws will consider your deposit eligible! Any unclaimed prizes will expire after a period of 60 days.',
            },
        ],
        shareTwitter: 'Share on Twitter',
        goToMyPlace: 'Go to my place',
        seeOnMintscan: 'See transaction on Mintscan',
        seeOnExplorer: 'See transaction on Lum Explorer',
    },
};
