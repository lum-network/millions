const isTestEnv = (): boolean => {
    return window.location.href.includes('localhost') || window.location.href.includes('testnet');
};

export const LANDING = '/';
export const HOME = '/dashboard';
export const POOLS = '/pools';
export const POOL_DETAILS = '/pools/details';
export const MY_SAVINGS = '/my-savings';
export const WINNERS = '/winners';
export const LUM_EXPLORER = `https://explorer.${isTestEnv() ? 'testnet.' : ''}lum.network`;
export const DOCUMENTATION = 'https://docs.cosmosmillions.com';
export const FAQ = '#faq';
export const DISCORD = 'https://discord.com/invite/PWHUMdwQ5r';
export const TWITTER = 'https://twitter.com/CosmosMillions';
export const MEDIUM = 'https://medium.com/lum-network';
export const GITHUB = 'https://github.com/lum-network';
export const MINTSCAN = 'https://mintscan.io';
export const TWEET_URL = 'https://twitter.com/intent/tweet';
export const KEPLR_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap';
export const LEAP_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg';
export const COSMOSTATION_EXTENSION_URL = 'https://chrome.google.com/webstore/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf';
export const LEAP_DEEPLINK = 'https://leapcosmoswallet.page.link/4FQqpcNVJtTEb7yC8';
export const BUY_LUM = 'https://app.osmosis.zone/?from=ATOM&to=LUM';

export const INTERCHAIN_WALLETS_DOC = 'https://docs.cosmosmillions.com/welcome/getting-started/get-an-interchain-wallet';
export const INTERCHAIN_TOKENS_DOC = 'https://docs.cosmosmillions.com/welcome/getting-started/get-interchain-tokens';
export const FAQ_DOC = 'https://docs.cosmosmillions.com/welcome/faq';

export const LEXICON_DOC = 'https://docs.cosmosmillions.com/cosmos-millions/lexicon';
export const MAIN_RULES_DOC = 'https://docs.cosmosmillions.com/cosmos-millions/introduction';
export const POOL_MANAGEMENT_DOC = 'https://docs.cosmosmillions.com/cosmos-millions/pool-management';
export const DEPOSITS_AND_WITHDRAWALS_DOC = 'https://docs.cosmosmillions.com/cosmos-millions/deposits-and-withdrawals';
export const DRAW_MECHANISM_DOC = 'https://docs.cosmosmillions.com/cosmos-millions/draw-mechanism';

export const TANDC = 'https://cosmosmillions.com/terms.pdf';

export type PoolsParams = { poolId: string; denom: string };
