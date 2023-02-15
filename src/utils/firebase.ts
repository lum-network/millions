import { initializeApp, FirebaseApp } from 'firebase/app';
import { Analytics, getAnalytics } from '@firebase/analytics';
import { FirebaseConstants } from 'constant';
class Firebase {
    private static instance?: Firebase;

    public app?: FirebaseApp;
    public analytics?: Analytics;
    private constructor() {
        this.app = initializeApp(FirebaseConstants.FIREBASE_CONFIG);
        this.analytics = getAnalytics(this.app);
    }

    public static getInstance(): Firebase {
        if (!this.instance) {
            this.instance = new Firebase();
        }

        return this.instance;
    }
}

export default Firebase.getInstance();
