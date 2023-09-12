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
        edit: 'Edit',
        copiedAddress: 'Copied address to clipboard !',
        draw: 'Draw',
        deposit: 'Deposit',
        pool: 'Pool',
        prizePool: 'Estimated Prize Pool',
        drawInProgress: 'Draw in progress',
        loading: 'Loading...',
        prev: 'Prev',
        next: 'Next',
    },
    collapsible: {
        closeDetails: 'Close&nbsp;details',
        openDetails: 'Open&nbsp;details',
    },
    errors: {
        generic: {
            required: '{{ field }} is required',
            invalid: 'Invalid {{ field }}',
        },
        walletProvider: {
            notInstalled: 'Please install {{ provider }} extension',
            notLatest: 'Please use an up to date version of the {{ provider }} extension',
            network: 'Failed to connect to the network',
            networkAdd: 'Failed to add network to {{ provider }}',
            wallet: 'Failed to connect to {{ provider }} wallet',
            offlineSigner: 'Offline signer not found',
        },
        client: {
            rpc: 'Error with RPC connection to other chain. IBC transactions may not work.',
            lum: 'Error with RPC connection to Lum Network.',
            chainId: '{{ denom }} chain-id not found.',
            unavailableRpc: '{{ denom }} rpc is unavailable.',
            noWalletConnected: 'No wallet connected',
        },
        deposit: {
            lessThanZero: 'Amount must be greater than 0',
            lessThanMinDeposit: 'Amount must be equal to or greather than {{ minDeposit }} {{ denom }}',
            greaterThanBalance: 'Amount must be less than available balance',
            fees: 'Not enough LUM to pay fees',
            generic: 'Failed to deposit to {{ denom }} pool',
        },
        '404': {
            title: 'Error 404',
            description: 'This page does not exist.',
        },
        copyAddress: 'Failed to copy address to clipboard, try again later',
        ibcTransfer: 'Failed to transfer, please try again later.',
        leavePool: 'Failed to leave {{ denom }} pool #{{ poolId }}',
        claimPrize: 'Failed to claim prizes',
        claimAndCompound: 'Failed to compound prizes',
        withdrawalRetry: 'Failed to retry withdrawal #{{ withdrawalId }} to pool #{{ poolId }}',
    },
    success: {
        wallet: 'Successfully connected',
        ibcTransfer: 'Successfully transferred {{ amount }} {{ denom }} to {{ chain }}',
        deposit: 'Successfully deposited {{ amount }} {{ denom }}',
        leavePool: 'Successfully left {{ denom }} pool {{ poolId }}',
        claimPrize: 'Successfully claimed prizes',
        claimAndCompound: 'Successfully compounded prizes',
        logOut: 'You have been logged out.',
        withdrawalRetry: 'Successfully retried withdrawal #{{ withdrawalId }} to pool #{{ poolId }}',
    },
    pending: {
        ibcTransfer: 'Transferring...',
        deposit: 'Depositing to {{ denom }} pool...',
        leavePool: 'Leaving {{ denom }} pool #{{ poolId }}',
        claimPrize: 'Claiming prizes...',
        claimAndCompound: 'Compounding prizes...',
        withdrawalRetry: 'Retrying withdrawal #{{ withdrawalId }} to pool #{{ poolId }}',
    },
    landing: {
        howItWorks: 'How it Works',
        documentation: 'Documentation',
        faq: 'FAQ',
        openTheApp: 'Open the App',
        saving: {
            title: 'Win Big by<br />Saving Smart',
            p1: 'Introducing Cosmos Millions, a DeFi protocol and open-source platform for prize savings.',
            p2: 'The prize-linked savings account that brings excitement to your crypto journey!',
            cta: 'Earn by saving',
            biggestPrizeToWin: 'Biggest Prize to Win',
        },
        cosmosGame: {
            title: 'Time to Spice Up\nthe Cosmos Game!',
            p1: "That's one small step for Cosmonauts,\none giant leap for Cosmos.",
            p2: 'Discover a new thrilling utility for your assets with Cosmos Millions’ prize-linked savings accounts.',
            p3: 'Deposit your assets into our protocol, and join in regular, randomized draws for a chance to win community-contributed prizes.',
            p4: 'Experience a secure and innovative saving method without compromising on excitement!',
        },
        winners: {
            title: 'How it Works',
            p1: 'Deposit\nyour assets',
            p2: 'You are eligible for all the next\nprizes automatically ',
            p3: 'You win! Cash out or compound your prize to boost your chances of earning more next time!',
            p4: 'No win this time, but no loss either! Get ready for the next draw!',
            or: 'OR',
        },
        pools: {
            title: 'Pools Available',
            deposited: 'Deposited',
            prizeToWin: 'Estimated Prize',
            newPool: 'Suggest a new pool',
            tvl: 'Total Value Locked',
            cta: 'See all pools',
        },
        future: {
            title: 'The Future of Savings\nwith Cosmos Millions',
            p1: 'Leveraging the Interchain Stack (Cosmos-SDK, Tendermint BFT, IBC, ICA, ICQ), our prize-linked savings enhance traditional savings methods.',
            p2: 'The sovereign and interoperable network of blockchains offers easy access and minimal fees, highlighting the extensive potential of the Internet of Blockchains.',
            p3: 'Our open-source, audited protocol ensures fair prize distribution, making saving a more positive and rewarding experience for all users!',
            cta: 'Start saving now!',
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
                    title: 'What is a Prize-Linked Savings Account?',
                    answer: 'A prize-linked savings account (PLSA) combines the stability of a traditional savings account with the excitement of potential rewards. In a PLSA, the deposits are gathered and collectively they generate a yield. Then, this yield is distributed as prizes to randomly selected account holders. Such an approach incentivizes individuals to save money by offering them the chance to win substantial rewards without risking their initial deposits.',
                },
                {
                    title: 'Is Cosmos Millions free to use?',
                    answer: 'Yes anyone can deposit and participate for free.\nTransaction fees are very cheap - usually less than a USD cent - thanks to the underlying technology. When a prize is distributed, Cosmos Millions takes a 10% fee. This is fundamental to ensure long-term viability of the blockchain infrastructure used.',
                },
                {
                    title: 'How can I participate?',
                    answer:
                        'To participate to Cosmos Millions, you first need:<ul><li>A Keplr Wallet</li><li>Cosmos Ecosystem tokens to save</li></ul>' +
                        'Then you can deposit your savings into Cosmos Millions to start participating.\n' +
                        'Check the <a target="_blank" rel="noreferrer" href="https://docs.cosmosmillions.com/welcome/getting-started">🚀Getting Started</a> section and follow the onboarding to participate.',
                },
                {
                    title: 'How are the prizes generated?',
                    answer: 'Cosmos Millions generates prizes based on the rewards earned from deposited savings. Whenever a user makes a deposit into the platform, the tokens are ultimately sent back to their native blockchain, where they start generating staking rewards. These rewards are then distribute as prizes to users. To ensure the safety and security of the deposited funds, Cosmos Millions works with some of the most reliable validators in the Interchain.',
                },
                {
                    title: 'Are my deposits safe?',
                    answer:
                        'Cosmos Millions employs robust security measures to protect your deposited assets. When you make a deposit, your tokens are sent back to their native blockchain where they are staked with reputable validators in the Interchain. These validators have a track record of reliability and security, which helps ensure the safety of your deposits.\n' +
                        '\n' +
                        'Also, Cosmos Millions is open-source, and it has been thoroughly audited by Oak Security, an independent security firms to ensure its safety and reliability. See Security & Audit',
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
                    answer: 'After winning a prize on Cosmos Millions, you can claim it by accessing the "My savings" section of the web application. You have 30 days from the date of the draw to claim your prize. If you fail to claim your prize within this period, the prize will be added to the prize pool of the next draw. Don\'t forget to come check the platform regularly to ensure that you don\'t miss the deadline for claiming your prize!',
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
        footer: {
            learn: {
                title: 'Learn',
                wallet: 'Get an interchain wallet',
                tokens: 'Get interchain tokens',
                faq: 'FAQ',
            },
            documentation: {
                title: 'Documentation',
                lexicon: 'Lexicon',
                rules: 'Main rules and concepts',
                pool: 'Pool Management',
                deposits: 'Deposits & Withdrawals',
                drawMechanism: 'Draw Mechanism',
                allDoc: 'All documentation',
            },
            community: {
                title: 'Community',
                twitter: 'Twitter',
                discord: 'Discord',
                github: 'Github',
                medium: 'Medium',
            },
            builtOn: {
                title: 'Built on Lum Network',
                tAndC: 'Terms & Conditions',
            },
        },
    },
    keplrKeystoreChange: 'Keplr Key store/account has changed',
    leapKeystoreChange: 'Leap Key store/account has changed',
    keplrDownloadModal: {
        title: 'Connect your wallet ✌️',
        keplr: {
            description: 'You need an Interchain wallet<br />to use Cosmos Millions.',
        },
        leap: {
            description: 'You need an Interchain wallet<br />to use Cosmos Millions.<br />Mobile friendly',
        },
        link: 'Learn more about Interchain wallets',
        later: "I'll come back later",
        download: 'Download Keplr for Chrome',
    },
    chooseWalletModal: {
        keplr: 'Keplr Wallet',
        leap: 'Leap Wallet',
    },
    logoutModal: {
        title: 'Are you sure you want\nto log out ?',
        logoutBtn: 'Log out',
    },
    termsModal: {
        title: 'Terms of use',
        description: 'Please read these terms carefully and click the button at the bottom to acknowledge that you have read and accepted the terms and conditions',
        checkbox: 'Accept Terms of use',
        cta: 'Accept',
        cancel: 'Cancel',
    },
    home: {
        title: 'Dashboard',
        nextBestPrize: 'Next Draw',
        lastBigWinners: 'Luckiest Winners',
        totalValueLocked: 'Total Value Locked',
        cta: 'SAVE & WIN',
    },
    pools: {
        title: 'Pools',
        totalDeposit: 'Total Deposit',
        tvl: 'TVL:',
        apy: 'Estimated APR:',
        cta: 'Deposit in Pool',
        viewDetails: 'Chance to win',
        drawEndAt: 'Next draw in:',
        poolId: 'Pool',
    },
    poolDetails: {
        myDeposits: 'My {{ denom }} Deposits',
        prizePool: 'Estimated Prize',
        prizePoolHint: `This is a calculation of the estimated prize pool at draw time, based on factors such as the native chain APR and the current TVL. The current prize pool is {{ prizePool }} {{ denom }} (\${{ prizePoolInUsd }})`,
        nextDraw: 'Next Draw',
        viewDetails: 'View Details',
        variableAPY: 'Estimated APR',
        tvlDetails: {
            title: 'Total Value Locked Details',
            sponsor: 'Sponsorship',
            deposits: 'Cosmonauts Deposits',
        },
        winners: {
            title: 'Winners in Numbers',
            totalPrizes: 'Total prizes won',
            totalPoolPrizes: "Total pool's prizes",
            bestPrizeWon: 'Largest prize won',
        },
        users: {
            title: 'Users in Numbers',
            deposit: 'Average deposit',
            currentDraw: 'Unique depositors',
        },
        prizeDistribution: {
            title: 'Prize Distribution',
            tableHeaders: ['Prize value', 'Number of prizes'],
            hint: 'Each category is associated with a prize value ($ amount), a maximum number of prizes distributed (number between 1 and 1,000) and a chance to win prizes in this category (expressed as 1 out of N).',
        },
        winningChances: {
            title: 'Winning Chances',
            estimatedSavings: 'Estimated savings',
            chanceToWin: 'Estimated chance to win',
        },
        drawsHistory: {
            title: 'Draws History',
            noDraws: 'No draws yet',
            noDrawsDescription: 'Draws will be available as soon as the first prize is won',
            noDrawsCta: 'Deposit in Pool',
            tableHeaders: ['Draw ID', 'Date', 'Prizes', 'Prize value'],
        },
        drawDetails: {
            winnersBtn: 'Winners',
            redelegatedPrizeBtn: 'Not won',
            nextPool: 'Any prize amount not won during a draw will be rolled over and added to the prize pool for subsequent draws.',
            tryBtn: 'Try your chances',
        },
    },
    mySavings: {
        title: 'My Savings',
        assets: 'Available Assets',
        totalBalance: 'Total Deposits',
        claim: 'Claim',
        claimPrize: 'Claim Prize',
        deposit: 'Deposit in Pool',
        depositorsRanking: 'Depositors Ranking',
        withdraw: 'Transfer out',
        activities: 'Past Transactions',
        transactionTypes: {
            leavePool: 'Leave Pool',
            claimPrize: 'Claim Prize',
            deposit: 'Deposit',
        },
        txListHeaders: ['Type', 'Hash', 'Amount'],
        deposits: 'Pool Deposits',
        leavePoolCta: 'Leave Pool',
        depositDrop: 'Deposit Drop',
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
            title: "Get LUM to participate to Cosmos Millions' governance",
            description:
                "As a LUM holder, you play a role in shaping the Cosmos Millions protocol's future. Your ability to propose and vote on changes empowers you to steer the protocol in the best possible direction.",
            cta: 'Buy $LUM on Osmosis',
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
            cta: 'Transfer',
        },
        claimModal: {
            title: 'Cosmonaut,\nyour savings are blasting off like a rocketship 🚀',
            cardTitle: 'Claim my Prizes',
            steps: [
                {
                    title: 'Wonderful! Take a look at what you have won!',
                    subtitle: 'Click on “Claim & Compound” to get your prizes and increase your chances for the next draws!\nOR Click on “Claim my prizes” to simply get your prizes',
                },
                {
                    title: 'Confirm your claim in Keplr',
                    subtitle: 'Accept the transaction to claim your prizes!',
                },
            ],
            claimOnlySteps: [
                {
                    title: 'Wonderful! Take a look at what you have won!',
                    subtitle: 'Click on “Claim my prizes” to simply get your prizes',
                },
                {
                    title: 'Confirm your claim in Keplr',
                    subtitle: 'Accept the transaction to claim your prizes!',
                },
            ],
            claimAndCompound: 'CLAIM & COMPOUND',
            claimAndCompoundHint: "You can't compound your prizes if you have less than the minimum deposit.",
            claimMyPrizes: 'Claim My Prizes',
            drawId: 'Draw #{{ drawId }}',
            shareTitle: 'Spread the word!',
            shareTwitterContent:
                'Just claimed my ${{ denom }} prize on @cosmosmillions! ️🏆 🚀\n\nJoin us and help skyrocket our pool of {{ tvl }} and stand a chance to win hundreds of prizes every week! 🧑‍🚀 #Cosmos https://cosmosmillions.com',
        },
        claimOnlyModal: {
            title: 'Hey Cosmonaut 🧑‍🚀',
            subtitle: "Are you sure you don't want to compound your prizes?",
            info: 'Participants who compound increase\ndrastically their next winning chances!',
            claimBtn: 'Just claim',
            claimAndCompoundBtn: "Let's compound 🎉",
        },
        depositStates: ['Unspecified', 'Deposit In Progress', 'Deposit In Progress', 'Success', 'Deposit error'],
        withdrawalStates: ['Unspecified', 'Undelegate', 'Unbonding', 'IBC Transfer', 'Withdrawal error', 'Pending withdrawal'],
        depositError: {
            title: 'Deposit error',
            description: 'Check your deposits ! An error occurred and you should be able to retry your failed deposit(s).',
        },
        depositUnbondingRemaining: ' remaining',
        newPrize: {
            title: 'Congrats! 🎉',
            description: "Cosmonaut, you've won a prize! Claim it before time runs out!",
        },
        prizeExpiration: 'Expires {{ expiration }}',
        leavePoolModal: {
            title: 'Finally ready\nto hang up your spacesuit, Cosmonaut?',
            steps: [
                {
                    title: 'Choose the pool you want to leave',
                    subtitle: 'Redeem your savings',
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
                waiting: 'Need to wait {{ unbondingTime }} days for the amount to be liquid',
            },
            cta: 'Leave pool',
        },
        sponsorHint: 'Sponsorship deposit, it will not be eligible for draws but will increase the prize pool.',
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
            'Deposit will lock your assets for {{ unbondingTime }} days.\nTo make your assets liquid again, you will need to leave the pool.\nThis process will take {{ unbondingTime }} days to complete.\n<a target="_blank" rel="noreferrer noopener" href="https://docs.cosmosmillions.com/welcome/faq#why-is-there-an-unbonding-period-on-my-deposit">Learn why</a>',
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
            title: 'Your savings are now<br />in good hands! 🥳',
            subtitle: 'You are always eligible for all the next draws coming!<br/>Share your deposit on Twitter to see<br />how high the total amount saved can go!',
        },
        shareTwitter: 'Share on Twitter',
        shareTwitterContent:
            'I have just deposited in @cosmosmillions’ ${{ denom }} pool ⚛️🎉\n\nJoin me and all the others Cosmonauts 🧑‍🚀 we have deposited {{ tvl }} so far! Dozens of prizes to win every week in this prize-linked savings account built for the Interchain #CosmosSZN #Cosmos #IBCGang',
        goToMySavings: 'Go to\nmy savings',
        seeOnMintscan: 'See transaction\non Mintscan',
        seeOnExplorer: 'See transaction\non Lum Explorer',
        quitModal: {
            title: 'You are leaving this page. You will not lose any asset but your progress will not be saved',
            continue: 'Leave page',
            cancel: 'Stay here',
        },
        ibcTransferModal: {
            title: 'You are trying to deposit more tokens than your available balance on the Lum Network.',
            subtitle: 'You already transferred <strong>{{ prevAmount }} {{ denom }}</strong> on Lum Network.\nDo you want to add an extra <strong>{{ nextAmount }} {{ denom }}</strong>?',
            prevAmountLabel: 'Amount requested',
            nextAmountLabel: 'Missing amount',
            cta: 'Add {{ nextAmount }} {{ denom }}',
            cancel: 'No thanks',
        },
        depositId: 'Deposit #{{ depositId }}',
        deposits_one: '{{ count }} Deposit',
        deposits_other: '{{ count }} Deposits',
        depositDeltaHint:
            'As your deposit is occurring within the last 5 minutes prior to the draw, you are not eligible to this one.\n\nGood news, you will enjoy a 100% Time Weighted Balance for all future draws. ' +
            '<a href="https://docs.cosmosmillions.com/cosmos-millions/draw-mechanism#time-weighted-balance-twb" rel="noreferrer" target="_blank">See why.</a>',
    },
    luckiestWinners: {
        title: 'Luckiest Winners',
        latestWinners: 'Latest Winners',
        winnersHeaders: ['Winner', 'Draw', 'Date', 'Amount'],
        noWinnersYet: {
            title: 'You could be here!',
            description: "Participating in this drawing has a higher\nchance of winning, so don't delay!",
            cta: 'Deposit in Pool',
        },
    },
    leaderboard: {
        hint: 'The depositors ranking is updated every hour',
        cta: 'See more',
        notConnectedCta: 'Log in to see more',
        depositBtn: 'Deposit {{ amount }} {{ denom }} to take his place',
        newRanking: 'You new ranking will be displayed in a few minutes',
    },
};
