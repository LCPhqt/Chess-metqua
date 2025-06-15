import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../FireBase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userDoc.data()
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ user, loading }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 