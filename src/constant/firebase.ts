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
};
