import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    console.log("AuthContext: User detected, fetching document...", user.uid);
                    // Check if user document exists in Firestore
                    const userDocRef = doc(db, 'Users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (!userDoc.exists()) {
                        console.log("AuthContext: User document not found. Assumed new user. Creating...");
                        // Create basic user profile on first login
                        await setDoc(userDocRef, {
                            email: user.email,
                            createdAt: new Date(),
                            role: 'client', // Default role
                            profileSetupComplete: false
                        });
                        console.log("AuthContext: Document created successfully.");
                    }

                    // Add Firestore data to the user object
                    let userData = { role: 'client' }; // Default fallback
                    try {
                        if (userDoc && userDoc.exists()) {
                            userData = userDoc.data();
                        }
                    } catch (e) { console.warn("Could not read user data"); }

                    setCurrentUser({ ...user, ...userData });
                    console.log("AuthContext: Current user state established.");
                } catch (error) {
                    console.error("AuthContext Critical Error during user initialization:", error);
                    // Fallback to basic client profile so the app doesn't white-screen
                    setCurrentUser({ ...user, role: 'client' });
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
