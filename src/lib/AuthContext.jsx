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

                    let userData = null;

                    if (!userDoc.exists()) {
                        console.log("AuthContext: User document not found. Assumed new user. Creating...");
                        // Create basic SaaS user profile on first login (pending assignment)
                        userData = {
                            email: user.email,
                            createdAt: new Date(),
                            role: 'unassigned', // User has NO permissions until an admin assigns a role/empresa
                            empresaId: null, // No company assigned yet
                            sucursalId: null, // No branch assigned yet
                            profileSetupComplete: false
                        };
                        await setDoc(userDocRef, userData);
                        console.log("AuthContext: Profile created successfully.");
                    } else {
                        userData = userDoc.data();
                    }

                    // For extremely legacy users who might not have these fields
                    if (userData && userData.role !== 'super_admin' && userData.role !== 'unassigned' && !userData.empresaId) {
                        console.warn("Legacy user detected. Needs forced migration to an empresaId.");
                    }

                    setCurrentUser({ ...user, ...userData });
                    console.log("AuthContext: Current user state established:", userData.role);
                } catch (error) {
                    console.error("AuthContext Critical Error during user initialization:", error);
                    // Fallback to absolute minimum safety profile so the app handles errors safely
                    setCurrentUser({ ...user, role: 'unassigned' });
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
