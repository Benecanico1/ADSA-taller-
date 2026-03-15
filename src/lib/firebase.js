// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXFaF4mSV8ct2qxmvBvQf6QG-jj4g2Peo",
    authDomain: "dynotech-power-garaje.firebaseapp.com",
    projectId: "dynotech-power-garaje",
    storageBucket: "dynotech-power-garaje.firebasestorage.app",
    messagingSenderId: "442979078793",
    appId: "1:442979078793:web:b8461be77c8d4881b36c58",
    measurementId: "G-5NYBX1LHTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Prevent Google Analytics / Firebase Installations from hanging in localhost
// const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
import { GoogleAuthProvider } from "firebase/auth";
export const googleProvider = new GoogleAuthProvider();

import { getFirestore, initializeFirestore } from "firebase/firestore";

// Initialize Cloud Firestore and get a reference to the service
// Force Long Polling to prevent "Offline" client hang / timeout in Vite local environments
// Use Try/Catch to avoid crash during Vite Hot Module Replacement (HMR) reloads
export let db;
try {
    db = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false
    });
} catch (e) {
    db = getFirestore(app);
}

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
