import { createContext, useContext, useEffect, useState } from 'react';
import {
    watchAffiliateAuth,
    listenAffiliateData,
    logoutAffiliate,
    getAffiliateData
} from '../firebase/affiliates.js';

const AffiliateContext = createContext(null);

export function AffiliateProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authUser, setAuthUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* Auth state listener */
    useEffect(() => {
        const unsub = watchAffiliateAuth(async (fbUser) => {
            if (fbUser) {
                setAuthUser(fbUser);
                /* Firestore থেকে ইউজার ডেটা আনি */
                const data = await getAffiliateData(fbUser.uid);
                setUser(data);
            } else {
                setAuthUser(null);
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    /* Firestore-এর ডেটা রিয়েল-টাইম লিসেন */
    useEffect(() => {
        if (!authUser) return;

        const unsub = listenAffiliateData(
            authUser.uid,
            (data) => setUser(data),
            () => {}
        );
        return () => unsub();
    }, [authUser]);

    const logout = () => logoutAffiliate();

    return (
        <AffiliateContext.Provider
            value={{
                user,
                authUser,
                loading,
                isLoggedIn: !!authUser,
                logout
            }}
        >
            {children}
        </AffiliateContext.Provider>
    );
}

export function useAffiliate() {
    const ctx = useContext(AffiliateContext);
    if (!ctx) throw new Error('useAffiliate must be inside AffiliateProvider');
    return ctx;
}