export const FIREBASE_CONFIG = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY ?? '',
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ?? '',
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL ?? '',
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID ?? '',
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ?? '',
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ?? '',
    appId: process.env.REACT_APP_FIREBASE_APP_ID ?? '',
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ?? '',
};

// Analytics
export const ANALYTICS_EVENTS = {
    SCREEN_VIEW: 'screen_view',
    TERMS_VIEW: 'terms_view',
    TERMS_ACCEPTED: 'terms_accepted',
    TERMS_DECLINED: 'terms_declined',
    OPEN_APP_CLICK: 'open_app_click',
    TWITTER_CLICK: 'twitter_click',
    DOCUMENTATION_CLICK: 'documentation_click',
    DISCORD_CLICK: 'discord_click',
    SUGGEST_POOL_CLICK: 'suggest_pool_click',
    SEE_ALL_POOLS_CLICK: 'see_all_pools_click',
    GITHUB_CLICK: 'github_click',
    MEDIUM_CLICK: 'medium_click',
    TERMS_CLICK: 'terms_click',
    LEARN_CLICK: 'learn_click',
    SAVE_AND_WIN_CLICK: 'save_and_win_click',
    DASHBOARD_CLICK: 'dashboard_click',
    POOLS_CLICK: 'pools_click',
    MY_SAVINGS_CLICK: 'my_savings_click',
    ADDRESS_COPIED: 'address_copied',
    LOGOUT_CLICK: 'logout_click',
    LOGOUT_CONFIRMED: 'logout_confirmed',
    LOGOUT_CANCELLED: 'logout_cancelled',
    SIGN_IN: 'sign_in',
    BEST_PRIZE_CARD_CLICK: 'best_prize_card_click',
    LUCKIEST_WINNERS_CARD_CLICK: 'luckiest_winners_card_click',
    CLAIM_PRIZE_CLICK: 'claim_prize_click',
    BUY_LUM_CLICK: 'buy_lum_click',
    DEPOSITS_OPEN_DETAILS_CLICK: 'deposits_open_details_click',
    DEPOSITS_CLOSE_DETAILS_CLICK: 'deposits_close_details_click',
};
