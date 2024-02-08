import { WalletProvider } from 'constant';

export const getMillionsDevnetKeplrConfig = (provider: WalletProvider) => {
    return {
        bech32Config: {
            bech32PrefixAccAddr: 'cosmos',
            bech32PrefixAccPub: 'cosmospub',
            bech32PrefixConsAddr: 'cosmosvalcons',
            bech32PrefixConsPub: 'cosmosvalconspub',
            bech32PrefixValAddr: 'cosmosvaloper',
            bech32PrefixValPub: 'cosmosvaloperpub',
        },
        bip44: {
            coinType: provider === WalletProvider.Cosmostation ? 880 : 118,
        },
        chainId: 'gaia-devnet',
        chainName: 'Cosmos Hub [Test Millions]',
        chainSymbolImageUrl: 'https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/images/cosmoshub/chain.png',
        currencies: [
            {
                coinDecimals: 6,
                coinDenom: 'ATOM',
                coinGeckoId: 'cosmos',
                coinMinimalDenom: 'uatom',
            },
        ],
        features: [],
        feeCurrencies: [
            {
                coinDecimals: 6,
                coinDenom: 'ATOM',
                coinGeckoId: 'cosmos',
                coinMinimalDenom: 'uatom',
                gasPriceStep: {
                    average: 0.025,
                    high: 0.03,
                    low: 0.01,
                },
            },
        ],
        rest: 'https://testnet-rpc.cosmosmillions.com/atom/rest',
        rpc: 'https://testnet-rpc.cosmosmillions.com/atom/rpc',
        stakeCurrency: {
            coinDecimals: 6,
            coinDenom: 'ATOM',
            coinGeckoId: 'cosmos',
            coinMinimalDenom: 'uatom',
        },
    };
};
