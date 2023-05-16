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
        retry: 'Retry',
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
        howItWorks: 'How it works',
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
            p1: "That's one small step for Cosmonauts,\none giant leap for Cosmos.",
            p2: 'Discover a new thrilling utility for your assets with Cosmos Millions’ prize-linked savings accounts.',
            p3: 'Deposit your assets into our protocol, and join in regular, randomized draws for a chance to win community-contributed prizes.',
            p4: 'Experience a secure and innovative saving method without compromising on excitement!',
        },
        winners: {
            title: 'One Winner, No Losers!',
            p1: 'Deposit\nyour assets',
            p2: 'You’re eligible to all the next\nprizes automatically ',
            p3: 'You win! Compound your prize to boost your chances of earning more next time!',
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
            p1: 'Leveraging the Interchain Stack (Cosmos-SDK, Tendermint BFT, IBC, ICA, ICQ), our prize-linked savings enhance traditional savings methods.',
            p2: 'The sovereign and interoperable network of blockchains offers easy access and minimal fees, highlighting the extensive potential of the Interchain of Blockchains.',
            p3: 'Our open-source, audited protocol ensures fair prize distribution, making saving a more positive and rewarding experience for all users!',
            cta: 'Start saving now!',
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
                    title: 'Is Cosmos Millions free to use?',
                    answer: 'Yes anyone can deposit and participate for free.\n\nTransaction fees are very cheap - usually less than a USD cent - thanks to the underlying technology. When a prize is distributed, Cosmos Millions takes a 10% fee. This is fundamental to ensure long-term viability of the blockchain infrastructure used.',
                },
                {
                    title: 'How are the prizes generated?',
                    answer: 'Cosmos Millions generates prizes based on the rewards earned from deposited savings. \n\nWhenever a user makes a deposit into the platform, the tokens are ultimately sent back to their native blockchain, where they start generating staking rewards. These rewards are then distribute as prizes to users.\n\nTo ensure the safety and security of the deposited funds, Cosmos Millions works with some of the most reliable validators in the Interchain.',
                },
                {
                    title: "What if I don't win?",
                    answer: 'No win, but no loss either. Your deposits will make you a participant in all the upcoming draws, and therefore will make you eligible for all the upcoming prizes.',
                },
                {
                    title: 'Is there a minimum deposit?',
                    answer: 'Yes, each pool has a minimum deposit amount. It is usually quite low and there just to prevent spam transactions.',
                },
                {
                    title: 'Why is there an unbonding period on my deposit?',
                    answer:
                        'Your deposit is bonded by Cosmos Millions on the native blockchain (e.g: Cosmos Hub for $ATOM) to generate interest. \n\n' +
                        'On each blockchain of the Cosmos Ecosystem, there is an specific unbonding period to ensure the security and stability of the network. By locking up your tokens for a specified period of time, you are contributing to the security of the blockchain and reducing the risk of network attacks or manipulation. \n\n' +
                        'Additionally, the unbonding period incentivizes long-term participation and discourages short-term speculation, promoting a healthy and sustainable ecosystem. \n\n' +
                        'The unbonding period depends on the network - it is generally set between 14 and 28 days.',
                },
                {
                    title: 'How long do I have to claim my prizes?',
                    answer:
                        'After winning a prize on Cosmos Millions, you can claim it by accessing the "My savings" section of the web application. \n\n' +
                        "You have 30 days from the date of the draw to claim your prize. If you fail to claim your prize within this period, the prize will be added to the prize pool of the next draw. Don't forget to come check the platform regularly to ensure that you don't miss the deadline for claiming your prize!",
                },
                {
                    title: 'Is Cosmos Millions audited?',
                    answer: 'Cosmos Millions code is currently being audited by a third-party company.',
                },
                {
                    title: 'What is the Cosmos ecosystem?',
                    answer: 'The Cosmos ecosystem is a decentralized and interoperable network of independent blockchains, applications, and services communicating through the Inter-Blockchain Communication (IBC) protocol.',
                },
                {
                    title: 'What is the Lum Network?',
                    answer:
                        'The Lum Network is a secure and sustainable blockchain from the Cosmos Ecosystem launched in December 2021. It is powered by the $LUM token, its native crypto-asset.\n\n' +
                        'Lum comes from the word “light” and expresses the value created by and for community members throughout their online and offline experiences.',
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
        title: 'Dashboard',
        nextBestPrize: 'Next draw',
        lastBigWinners: 'Luckiest winners',
        totalValueLocked: 'Total value locked',
        cta: 'SAVE & WIN',
    },
    pools: {
        title: 'Pools',
        totalDeposit: 'Total Deposit',
        tvl: 'TVL:',
        apy: 'Variable APY:',
        cta: 'Deposit in Pool',
        drawEndAt: 'Next draw in:',
        poolId: 'Pool #{{ poolId }}',
    },
    poolDetails: {
        myDeposits: 'My {{ denom }} deposits',
        biggestPrize: 'Prize Pool',
        nextDraw: 'Next Draw',
        viewDetails: 'View Details',
        variableAPY: 'Variable APY',
        winners: {
            title: 'Winners in Numbers',
            totalPrizes: 'Total prizes won',
            totalPoolPrizes: "Total pool's prizes",
            bestPrizeWon: 'Best Prize won',
        },
        users: {
            title: 'Users in Numbers',
            deposit: 'Average Deposit',
            currentDraw: 'Unique Depositors',
        },
        prizeDistribution: {
            title: 'Prize Distribution',
            tableHeaders: ['Prize Value', 'Number of prizes', 'Chance to win'],
        },
        winningChances: {
            title: 'Winning Chances',
            estimatedSavings: 'Estimated savings',
            chanceToWin: 'Chance to win',
        },
        drawsHistory: {
            title: 'Draws History',
            noDraws: 'No draws yet',
            noDrawsDescription: 'Draws will be available as soon as the first prize is won',
            noDrawsCta: 'Deposit in Pool',
            tableHeaders: ['Pool ID', 'Draw ID', 'Date', 'Winners', 'Prize Value'],
        },
        drawDetails: {
            winnersBtn: 'Winners',
            redelegatedPrizeBtn: 'Redelegated Prize',
            tryBtn: 'Try your chances',
        },
    },
    mySavings: {
        title: 'My Savings',
        assets: 'Available Assets',
        totalBalance: 'Total deposits',
        claim: 'Claim',
        claimPrize: 'Claim prize',
        deposit: 'Deposit in Pool',
        withdraw: 'Transfer out',
        activities: 'Past Transactions',
        deposits: 'Pool Deposits',
        leavePoolCta: 'Leave Pool',
        transferWaitingCta: 'Usually ~1 minute',
        noAssets: {
            title: 'No assets yet',
            description: 'It’s time to deposit assets in your wallet\nto participate to the next prize',
        },
        noPrizes: {
            title: 'No prize won yet',
            subtitle: 'It’s time to deposit in pools!',
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
                    title: 'Cosmonaut, your savings are\nblasting off like a rocketship 🚀',
                    subtitle: 'Share your Cosmos Millions prize on Twitter and contribute to increase the collective prize pool!',
                },
            ],
            claimAndCompound: 'CLAIM & COMPOUND',
            claimMyPrizes: 'Claim My Prizes',
            drawId: 'Draw #{{ drawId }}',
            shareTwitterContent:
                'My savings are going to the moon 🚀 I just claimed {{ amount }} ${{ denom }} of prizes into my @cosmosmillions prize savings account!\n\nJoin me and all the others Cosmonauts 🧑‍🚀 saving {{ tvl }}! Dozens of prizes to win every week #CosmosMillions #Cosmos https://cosmos.millions',
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
        newPrize: {
            title: 'Congrats! 🎉',
            description: "Cosmonaut, you've won a prize! Claim it before time runs out!",
        },
        leavePoolModal: {
            title: 'Finally ready\nto hang up your spacesuit, Cosmonaut?',
            steps: [
                {
                    title: 'Choose the pool you want to leave',
                    subtitle: 'Redeem your savings\nor transfer your available tokens',
                    cardTitle: 'Leave pool',
                    cardSubtitle:
                        'Redeem your savings is submitted to an unbonding period. <a target="_blank" rel="noreferrer noopener" href="https://docs.cosmosmillions.com/welcome/faq#why-is-there-an-unbonding-period-on-my-deposit">Learn why</a>',
                },
                {
                    title: 'Select the savings to redeem',
                    subtitle: 'Select the savings you want to redeem\nand accept the transaction on your Keplr wallet',
                },
            ],
            warnings: {
                title: 'Once the unbonding period begins you will:',
                draws: 'Not be selected for all future draws',
                cancel: 'Not be able to cancel the unbonding',
                waiting: 'Need to wait 21 days for the amount to be liquid',
            },
            cta: 'Leave pool',
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
        title: 'Few steps away<br/>from your deposit',
        transferBtn: 'Transfer',
        saveAndWinBtn: 'Save & Win',
        fees: 'Get $LUM on <a rel="noreferrer" target="_blank" href="https://app.osmosis.zone/?from=ATOM&to=LUM">Osmosis</a>\nor use the <a rel="noreferrer" target="_blank" href="https://discord.gg/KwyVvnBcXF">$LUM faucet on Discord</a>',
        chancesHint: {
            winning: {
                title: 'Winning chance',
                hint: 'This is an estimation of your chance of winning at least one prize per draw in this pool.',
            },
            averagePrize: {
                title: 'Average prize',
                hint: 'This is an estimation of the return from prizes.\nIt is based on a number of elements such as the TVL and the prize distribution',
            },
        },
        feesWarning: 'You need LUM for transaction fees',
        depositWarning:
            'Deposit will lock your assets for 21 days.\nTo make your assets liquid again, you will need to leave the pool.\nThis process will take 21 days to complete.\n<a target="_blank" rel="noreferrer noopener" href="https://docs.cosmosmillions.com/welcome/faq#why-is-there-an-unbonding-period-on-my-deposit">Learn why</a>',
        depositLabel: 'Amount to deposit',
        steps: [
            {
                title: 'Transfer {{ denom }} to Lum Network',
                subtitle: 'Transfer your {{ denom }} from {{ chainName }} to Lum Network',
                cardSubtitle: 'Transfer your {{ denom }} from<br />{{ chainName }} to Lum Network',
            },
            {
                title: 'Deposit into {{ denom }} pool',
                subtitle: 'Start your saving streak!',
                cardSubtitle: 'You are about to make your<br />savings beautiful!',
            },
        ],
        shareStep: {
            title: 'Your savings are now in good hands! 🥳',
            subtitle: 'You are always eligible for all the next draws coming! Share your deposit on Twitter to see how high the total amount saved can go!',
        },
        shareTwitter: 'Share on Twitter',
        shareTwitterContent:
            'My savings are going to the moon 🚀 I just saved {{ amount }} ${{ denom }} into my @cosmosmillions prize savings account!\n\nJoin me and all the others Cosmonauts 🧑‍🚀 saving {{ tvl }}! Dozens of prizes to win every week #CosmosMillions #Cosmos https://cosmos.millions',
        goToMySavings: 'Go to\nmy savings',
        seeOnMintscan: 'See transaction\non Mintscan',
        seeOnExplorer: 'See transaction\non Lum Explorer',
        quitModal: {
            title: 'If you leave this page, you will lose your progress. You will not lose any of your assets associated with this page.',
        },
        ibcTransferModal: {
            title: 'You are trying to deposit more tokens than your available balance on the Lum Network.',
            subtitle: 'You already transfered <strong>{{ prevAmount }} {{ denom }}</strong> on Lum Network.\nDo you want to add an extra <strong>{{ nextAmount }} {{ denom }}</strong>?',
            prevAmountLabel: 'Current amount of {{ denom }} deposited',
            nextAmountLabel: 'Amount of {{ denom }} to deposit',
            cta: 'Add {{ nextAmount }} {{ denom }}',
            cancel: 'No thanks',
        },
        depositId: 'Deposit #{{ depositId }}',
        deposits_one: '{{ count }} Deposit',
        deposits_other: '{{ count }} Deposits',
    },
    luckiestWinners: {
        title: 'Luckiest Winners',
        latestWinners: 'Latest Winners',
    },
};
