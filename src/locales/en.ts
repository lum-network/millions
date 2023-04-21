/* eslint-disable */

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
    common: {
        continue: 'Continue',
        cancel: 'Cancel',
    },
    errors: {
        generic: {
            required: '{{ field }} is required',
            invalid: 'Invalid {{ field }}',
        },
        keplr: {
            notInstalled: 'Please install keplr extension',
            notLatest: 'Please use an up to date version of the Keplr extension',
            network: 'Failed to connect to the network',
            networkAdd: 'Failed to add network to Keplr',
            wallet: 'Failed to connect to Keplr wallet',
        },
        client: {
            rpc: 'Error with RPC connection to other chain. IBC transactions may not work.',
            lum: 'Error with RPC connection to Lum Network.',
        },
        deposit: {
            lessThanZero: 'Amount must be greater than 0',
            lessThanMinDeposit: 'Amount must be greather than minimum deposit of {{ minDeposit }}',
            greaterThanBalance: 'Amount must be less than available balance',
            fees: 'Not enough LUM to pay fees',
        },
        '404': {
            title: 'Error 404',
            description: 'This page does not exist.',
        },
    },
    landing: {
        howItWorks: 'How it Works',
        documentation: 'Documentation',
        faq: 'FAQ',
        openTheApp: 'Open the app',
        saving: {
            title: 'Win Big by<br />Saving Smart',
            p1: 'Introducing Cosmos Millions, a decentralized finance protocol and open-source platform for prize savings.',
            p2: 'The prize-linked savings account with the highest returns ever made.',
            cta: 'Earn by saving',
            biggestPrizeToWin: 'Biggest prize to win',
        },
        cosmosGame: {
            title: 'Time to Spice Up\nthe Cosmos Game!',
            p1: "That's one small step for Cosmonauts, one giant leap for Cosmos.",
            p2: 'Speed up your path to financial tranquility with our thrilling prize-linked savings accounts! Save your assets in our protocol and random winners will receive prizes from the entire community at each draw.',
            p3: 'With no risk and exciting rewards, bring your savings to the moon!',
        },
        winners: {
            title: 'How it Works',
            p1: 'Deposit\nyour assets',
            p2: 'You’re eligible to all the next\nprizes automatically ',
            p3: 'You win! Compound your prize to boost your chances of earning more next time!',
            p4: 'No win this time, but no loss either! Get ready for the next draw!',
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
            p1: 'The utilization of Cosmos technology (Cosmos-SDK, Tendermint BFT, IBC, ICA) for Prize Linked Savings overthrows the savings methods in history. The use of sovereign and interoperable network of blockchains allows easy access with minimal fees, making it a standout in the blockchain industry and another confirmation of the limitless potential of the Interchain of Blockchains.',
            p2: 'With an open-source and audited protocol ensuring that prizes are distributed fairly, saving money has never been so rewarding!',
            cta: 'Want to retire in style?',
        },
        community: {
            title: 'Join the Cosmos\nMillions Community',
        },
        faqSection: {
            title: 'You have Questions? \nWe have the Answers',
            questions: [
                {
                    title: 'What is Cosmos Millions?',
                    answer: 'Cosmos Millions is a prize-linked savings account protocol that offers the opportunity to win prizes while saving money.',
                },
                {
                    title: 'How are the prizes generated?',
                    answer: 'Cosmos Millions generates its prizes based on the interest earned from deposited savings.<br />Whenever users make a deposit into the platform, the tokens are gathered into a pool and sent to their native blockchain. Then, the tokens are delegated to validators, and they start earning interest. This interest (staking rewards) is then used to generate prizes for the users on a larger scale than what each user could get individually.<br /><br />To ensure the safety and security of the deposited funds, Cosmos Millions delegates to some of the most reliable validators in the Interchain. You can leave a Cosmos Millions pool at any time and your tokens will be sent back to your wallet.',
                },
                {
                    title: 'How will the $5 000 ATOM launch incentives be distributed?',
                    answer: 'To give an incentive for people that register early, $5 000 ATOM worth of delegated deposits will be randomly distributed to 50 users ($100 each). The requirements to be part of the 50 chosen ones are to:<br /><br /><ul><li>Register before the deadline (May 3rd 12:00 UTC)</li><br /><li>Deposit at least 1 ATOM in the ATOM pool before the first draw</li></ul>You will be entitled to the prizes corresponding to this extra $100 participation for the next 3 months. At the end of the 3 months, you will keep the tokens you deposited and the incentive tokens will go back to the protocol.',
                },
                {
                    title: 'What are delegated deposits?',
                    answer: 'Delegated deposits allow users to participate in a pool while allocating any prize they receive to another wallet. It gives the beneficiary wallet a higher chance to be picked as the winner of the prizes. For the launch, Cosmos Millions itself will delegate deposits to 50 users that registered early.',
                },
                {
                    title: 'Is Cosmos Millions code audited?',
                    answer: 'Yes! Cosmos Millions code is currently under review by a third-party company. ',
                },
            ],
        },
    },
    keplrKeystoreChange: 'Keplr Key store/account has changed',
    keplrDownloadModal: {
        title: 'Connect your wallet ✌️',
        description: 'You need an Interchain wallet to use Cosmos Millions.<br />Keplr is the most popular wallet of them.',
        link: 'Learn more about Interchain wallets',
        later: "I'll come back later",
        download: 'Download Keplr for Chrome',
    },
    logoutModal: {
        title: 'Are you sure you want\nto log out ?',
        logoutBtn: 'Log out',
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
    mySavings: {
        title: 'My Savings',
        assets: 'Available Assets',
        totalBalance: 'Total balance',
        claim: 'Claim',
        claimPrize: 'Claim prize',
        deposit: 'Deposit in Pool',
        withdraw: 'Transfer out',
        activities: 'Activities',
        deposits: 'Pool Deposits',
        noAssets: {
            title: 'No assets yet',
            description: 'It’s time to deposit assets in your wallet\nto participate to the next prize',
        },
        governance: 'Governance',
        governanceCard: {
            title: 'Get LUM to participate to Cosmos Millions Protocol',
            description:
                "As a LUM holder in the Lum Network, you play a role in shaping the protocol's future. Your ability to propose and vote on changes to the protocol empowers you to influence the community and guide the network towards a positive future.",
            cta: 'Join our Discord',
        },
        transferOutModal: {
            title: 'Finally ready\nto hang up your spacesuit, Cosmonaut?',
            amountInput: {
                label: 'Select Amount:',
                sublabel: 'Available: {{ amount }} {{ denom }}',
            },
            steps: [
                {
                    title: 'Choose the assets you want to transfer out',
                    subtitle: 'Redeem your savings or transfer your available tokens',
                    cardTitle: 'Transfer my available tokens',
                    cardSubtitle: 'Transfer your tokens from the Lum Network to their native blockchain.',
                },
                {
                    title: 'Select the tokens to transfer',
                    subtitle: 'Select the tokens you want to transfer and accept the transaction on your Keplr wallet',
                },
            ],
            cta: 'Transfer my available tokens',
        },
        claimModal: {
            title: 'Cosmonaut,\nyour savings are blasting off like a rocketship 🚀',
            cardTitle: 'Claim my Prizes',
            steps: [
                {
                    title: 'Wonderful! Take a look at what you have won!',
                    subtitle: 'Click on “Claim & Compound” to get your prizes and increase your chances for the next draws! OR Click on “Claim my prizes” to simply get your prizes',
                },
                {
                    title: 'Confirm your claim in Keplr',
                    subtitle: 'Accept the transaction to claim your prizes!',
                },
                {
                    title: 'Spread the word!',
                    subtitle: 'Share your Cosmos Millions prize on Twitter and contribute to increase the collective prize pool!',
                },
            ],
            claimAndCompound: 'CLAIM & COMPOUND',
            claimMyPrizes: 'CLAIM MY PRIZES',
        },
        claimOnlyModal: {
            title: 'Hey Cosmonaut 🧑‍🚀',
            subtitle: "Are you sure you don't want to compound your prizes ?",
            info: 'Participants who compound increase\ndrastically their next winning chances!',
            claimBtn: 'Just claim',
            claimAndCompoundBtn: "Let's compound 🎉",
        },
        depositStates: ['Unspecified', 'Deposit In Progress', 'Deposit In Progress', 'Success', 'Error', 'Unbonding'],
        depositError: {
            title: 'Deposit error',
            description: 'Check your deposits ! An error occurred and you should be able to retry your failed deposit(s).',
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
        fees: 'Fees warning',
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
        depositWarning:
            'Deposit will lock your assets for 21 days.\nTo make your assets liquid again, you will need to leave the pool.\nThis process will take 21 days to complete.\n<a target="_blank" rel="noreferrer noopener" href="">Learn why</a>',
        depositLabel: 'Amount of {{ denom }} to deposit in the Pool',
        steps: [
            {
                title: 'Transfer {{ denom }} to Lum Network',
                subtitle: 'Put your tokens into on our chain to participate',
            },
            {
                title: 'Deposit in the {{ denom }} pool',
                subtitle: 'Start your saving',
                cardSubtitle: 'You are about to make your savings beautiful!',
            },
            {
                title: 'Saving review & share!',
                subtitle: 'By sharing Cosmos Millions to your community you will contribute to and increase the collective prize pool.',
                cardTitle: 'Your savings say thanks! ✌️',
                cardSubtitle: 'You are always eligible for all the next draws coming! Share your winning on Twitter to see how high the total amount saved can go!',
            },
        ],
        shareTwitter: 'Share on Twitter',
        shareTwitterContent: "I just deposited on Lum Network's Cosmos Millions project\nDo the same if you want to start saving and earning !",
        goToMySavings: 'Go to my savings',
        seeOnMintscan: 'See transaction on Mintscan',
        seeOnExplorer: 'See transaction on Lum Explorer',
        quitModal: {
            title: 'If you leave this page, you will lose your progress. You will not lose any of your assets associated with this page.',
        },
    },
};
