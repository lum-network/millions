import { Keplr, Window as KeplrWindow } from '@keplr-wallet/types';
import { Cosmos } from '@cosmostation/extension-client';

declare global {
    interface Window extends KeplrWindow {
        leap?: Keplr;
        cosmostation?: Cosmos;
    }
}
