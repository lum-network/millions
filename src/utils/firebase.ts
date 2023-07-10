import { initializeApp, FirebaseApp } from 'firebase/app';
import { signInAnonymously, signOut, getAuth, Auth } from 'firebase/auth';
import { Analytics, AnalyticsCallOptions, getAnalytics, logEvent, setUserId } from '@firebase/analytics';
import { FirebaseConstants } from 'constant';
class Firebase {
    private static instance?: Firebase;

    public app?: FirebaseApp;
    public auth?: Auth;
    public analytics?: Analytics;
    private constructor() {
        this.app = initializeApp(FirebaseConstants.FIREBASE_CONFIG);
        this.analytics = getAnalytics(this.app);
        this.auth = getAuth(this.app);
    }

    public static getInstance(): Firebase {
        if (!this.instance) {
            this.instance = new Firebase();
        }

        return this.instance;
    }

    // Auth
    signInAnonymous = async (): Promise<void> => {
        if (this.auth) {
            signInAnonymously(this.auth).finally(() => null);
        }
    };

    signOut = async (): Promise<void> => {
        if (this.auth) {
            signOut(this.auth).finally(() => null);
        }
    };

    // Analytics
    logEvent(eventName: string, eventParams?: { [key: string]: unknown }, options?: AnalyticsCallOptions): void {
        if (this.analytics) {
            logEvent(this.analytics, eventName, eventParams, options);
        }
    }

    setUserId(userId: string | null): void {
        if (this.analytics) {
            setUserId(this.analytics, userId);
        }
    }
}

export default Firebase.getInstance();
