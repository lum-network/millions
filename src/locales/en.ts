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
            p1: 'Introducing Cosmos Millions, a DeFi protocol and open-source platform for prize savings.',
            p2: 'The prize-linked savings account that brings excitement to your crypto journey!',
            cta: 'Earn by saving',
            biggestPrizeToWin: 'Biggest prize to win',
        },
        cosmosGame: {
            title: 'Time to Spice Up\nthe Cosmos Game',
            p1: "That's one small step for Cosmonauts, one giant leap for Cosmos.",
            p2: 'Speed up your path to financial tranquility with our thrilling prize-linked savings accounts! Save your assets in our protocol and random winners will receive prizes from the entire community at each draw.',
            p3: 'With no risk and exciting rewards, bring your savings to the moon!',
        },
        winners: {
            title: 'How it Works',
            p1: 'Deposit\nyour assets',
            p2: 'You are eligible to all the next\nprizes automatically ',
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
            p1: 'Leveraging the Interchain Stack (Cosmos-SDK, Tendermint BFT, IBC, ICA, ICQ), our prize-linked savings accounts enhance traditional savings methods.',
            p2: 'The sovereign and interoperable network of blockchains offers easy access and minimal fees, highlighting the extensive potential of the Interchain of Blockchains.',
            p3: 'Our open-source, audited protocol ensures fair prize distribution, making saving a more positive and rewarding experience for all users!',
            cta: 'Want to retire in style?',
        },
        community: {
            title: 'Join the Cosmos\nMillions Community',
        },
        faqSection: {
            title: 'FAQ',
            questions: [
                {
                    title: 'What is Cosmos Millions?',
                    answer: 'Cosmos Millions is a prize-linked savings account protocol that offers the opportunity to win prizes while saving money.',
                },
                {
                    title: 'What is a Prize-linked Savings Account?',
                    answer: 'A prize-linked savings account (PLSA) combines the stability of a traditional savings account with the excitement of potential rewards. In a PLSA, the deposits are gathered and collectively they generate a yield. Then, this yield is distributed as prizes to randomly selected account holders. Such an approach incentivizes individuals to save money by offering them the chance to win substantial rewards without risking their initial deposits.',
                },
                {
                    title: 'Is Cosmos Millions free to use?',
                    answer:
                        'Yes. Anyone can deposit and participate for free. Cosmos Millions is an open and accessible platform for all.' +
                        '\n\n' +
                        'To keep things running, the Cosmos Millions protocol automatically collects 10% fees over prizes once they are distributed. Fees goes toward Lum stakers, see <a target="_blank" rel="noreferrer" href="https://docs.cosmosmillions.com/cosmos-millions/protocol-fees">Protocol Fees</a> documentation for more information.' +
                        '\n\n' +
                        'This is fundamental to ensure long-term viability of the blockchain infrastructure used to support the Cosmos Millions protocol.' +
                        '\n\n' +
                        'Using Cosmos Millions requires to pay (blockchain) transaction fees that are usually extremely cheap, less than a USD cent, thanks to the blockchain technology being used.',
                },
                {
                    title: 'How can I participate?',
                    answer:
                        'To participate to Cosmos Millions, you first need:' +
                        '\n' +
                        '&nbsp&nbsp&nbsp• A Keplr Wallet' +
                        '\n' +
                        '&nbsp&nbsp&nbsp• Cosmos Ecosystem tokens to save' +
                        '\n\n' +
                        'Then you can deposit your savings into Cosmos Millions to start participating.' +
                        '\n' +
                        'Check the 🚀 <a target="_blank" rel="noreferrer" href="https://docs.cosmosmillions.com/welcome/getting-started">Getting Started</a> section and follow the onboarding to participate.',
                },
                {
                    title: 'How are the prizes generated?',
                    answer:
                        'Prizes on Cosmos Millions are generated from the staking rewards earned on user deposits.\nWhen a user makes a deposit, their tokens are sent back to their native blockchain where they are staked, generating rewards.\n' +
                        '\n' +
                        'These staking rewards are then collected and distributed as prizes on the Cosmos Millions protocol. In other words, the prizes are the result of the collective staking activity of all the deposited tokens.',
                },
                {
                    title: 'Are my deposits safe?',
                    answer:
                        'Cosmos Millions employs robust security measures to protect your deposited assets. When you make a deposit, your tokens are sent back to their native blockchain where they are staked with reputable validators in the Interchain. These validators have a track record of reliability and security, which helps ensure the safety of your deposits.\n' +
                        '\n' +
                        'Also, Cosmos Millions is open-source, and it has been thoroughly audited by Oak Security, an independent security firms to ensure its safety and reliability. <a target="_blank" rel="noreferrer" href="https://docs.cosmosmillions.com/cosmos-millions/security-and-audit">See Security & Audit</a>',
                },
                {
                    title: 'How will the $100,000 from ATOM Accelerator DAO grant be used?',
                    answer:
                        'The <a target="_blank" rel="noreferrer" href="https://www.atomaccelerator.com/">ATOM Accelerator DAO</a> granted us $100,000 worth of ATOMs on May 11, 2023.' +
                        '\n\n' +
                        'The full amount will be leveraged as liquidity for the ATOM pool, ensuring exciting prizes for our early depositors.',
                },
                {
                    title: "What if I don't win?",
                    answer: 'No win, but no loss either. Your deposits remain intact and continually make you eligible for upcoming draws. Also, you have complete control over your funds. You can withdraw your deposit at any time.',
                },
                {
                    title: 'How long do I have to claim my prizes?',
                    answer:
                        'When you win a prize on Cosmos Millions, you have a 30-days window from the draw date to claim your prize.' +
                        '\n\n' +
                        'Head to the My savings section of our web application to claim your prizes.' +
                        '\n' +
                        "To never miss a prize, we recommend activating prize notifications using our bot on Discord. This way, you'll always know when it's time to claim!" +
                        '\n\n' +
                        "If you don't claim your prize within the 30-days time frame, the prize will be clawed back by the protocol and will end up into the next draws' prize pools." +
                        '\n\n' +
                        'Remember, regular check-ins on the platform ensure you never miss out on any prizes!',
                },
                {
                    title: 'Is there a minimum deposit?',
                    answer:
                        'Yes, each pool does require a minimum deposit amount.' +
                        '\n\n' +
                        'However, this amount is typically quite small. Its purpose is to prevent unnecessary spam transactions to ensure the smooth operation of the system.',
                },
                {
                    title: 'Why is there an unbonding period on my deposit?',
                    answer:
                        'Your deposit is sent by Cosmos Millions on the native blockchain (e.g: Cosmos Hub for $ATOM) to generate staking rewards.' +
                        '\n\n' +
                        'On each blockchain of the Cosmos Ecosystem, there is a specific unbonding period to ensure the security and stability of the network. By locking up your tokens for a specified period of time, you are contributing to the security of the blockchain and reducing the risk of network attacks or manipulation.' +
                        '\n\n' +
                        'Additionally, the unbonding period incentivizes long-term participation and discourages short-term speculation, promoting a healthy and sustainable ecosystem.' +
                        '\n\n' +
                        'The unbonding period depends on the network - it is generally set between 14 and 28 days.',
                },
                {
                    title: 'How will the $5,000 ATOM launch incentives be distributed?',
                    answer:
                        'To give an incentive for people that register early, $5,000 ATOM worth of delegated deposits will be randomly distributed to 50 users ($100 each). The requirements to be part of the 50 chosen ones are to:' +
                        '\n\n' +
                        '&nbsp&nbsp&nbsp• register before <strong>May 3rd 12:00 UTC</strong>' +
                        '\n\n' +
                        '&nbsp&nbsp&nbsp• deposit at least 1 ATOM in the ATOM pool between the pool opening and the first draw.' +
                        '\n\n' +
                        'You will be entitled to the prizes corresponding to this extra $100 participation for the next 3 months. At the end of the 3 months, you will keep the tokens you deposited and the incentive tokens will go back to the protocol.',
                },
                {
                    title: 'What is the Cosmos Ecosystem?',
                    answer: 'The Cosmos ecosystem is a decentralized and interoperable network of independent blockchains, applications, and services communicating through the Inter-Blockchain Communication (IBC) protocol.',
                },
                {
                    title: 'What is the Lum Network?',
                    answer: 'The Lum Network is a secure and sustainable blockchain from the Cosmos Ecosystem launched in December 2021. It is powered by the $LUM token, its native crypto-asset. Lum comes from the word “light” and expresses the value created by and for community members throughout their online and offline experiences.',
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
