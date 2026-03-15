// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXFaF4mSV8ct2qxmvBvQf6QG-jj4g2Peo",
    authDomain: "adsa_taller-power-garaje.firebaseapp.com",
    projectId: "adsa_taller-power-garaje",
    storageBucket: "adsa_taller-power-garaje.firebasestorage.app",
    messagingSenderId: "442979078793",
    appId: "1:442979078793:web:b8461be77c8d4881b36c58",
    measurementId: "G-5NYBX1LHTJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
import { GoogleAuthProvider } from "firebase/auth";
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
// Attempting to explicitly target the (default) database to bypass initialization errors
export const db = getFirestore(app, '(default)');

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app);

export default app;
