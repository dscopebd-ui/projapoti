import { createContext, useContext, useEffect, useState } from 'react';
import { watchAuth, loginAdmin, logoutAdmin } from '../firebase/auth.js';
import { ADMIN_EMAILS } from '../data/siteConfig.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = watchAuth((u) => {
            /* ⚠️ শুধু ADMIN_EMAILS-এ থাকা ইমেইলই অ্যাডমিন */
            if (u && ADMIN_EMAILS.includes((u.email || '').toLowerCase())) {
                setUser(u);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const login = (email, password) => loginAdmin(email, password);
    const logout = () => logoutAdmin();

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isLoggedIn: !!user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
}