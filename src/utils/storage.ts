import { AUTOCONNECT_STORAGE_KEY, INFLUENCER_CAMPAIGN_KEY, WalletProvider } from 'constant';

export const storeAutoconnectKey = (provider: WalletProvider) => {
    localStorage.setItem(AUTOCONNECT_STORAGE_KEY, provider);
};

export const getAutoconnectProvider = () => {
    return localStorage.getItem(AUTOCONNECT_STORAGE_KEY) as WalletProvider | null;
};

export const storeCampaignKey = (campaignKey: string) => {
    localStorage.setItem(INFLUENCER_CAMPAIGN_KEY, campaignKey);
};

export const deleteCampaignKey = () => {
    localStorage.removeItem(INFLUENCER_CAMPAIGN_KEY);
};

export const getCampaignKey = () => {
    return localStorage.getItem(INFLUENCER_CAMPAIGN_KEY) as string | null;
};
