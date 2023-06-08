import { initializeApp, FirebaseApp } from 'firebase/app';
import { Analytics, AnalyticsCallOptions, getAnalytics, logEvent } from '@firebase/analytics';
import { FirebaseConstants } from 'constant';
class Firebase {
    private static instance?: Firebase;

    public app?: FirebaseApp;
    public analytics?: Analytics;
    private constructor() {
        if (process.env.NODE_ENV !== 'test') {
            this.app = initializeApp(FirebaseConstants.FIREBASE_CONFIG);
            this.analytics = getAnalytics(this.app);
        }
    }

    public static getInstance(): Firebase {
        if (!this.instance) {
            this.instance = new Firebase();
        }

        return this.instance;
    }

    // Analytics
    logEvent(eventName: string, eventParams?: { [key: string]: unknown }, options?: AnalyticsCallOptions): void {
        if (this.analytics) {
            logEvent(this.analytics, eventName, eventParams, options);
        }
    }
}

export default Firebase.getInstance();
