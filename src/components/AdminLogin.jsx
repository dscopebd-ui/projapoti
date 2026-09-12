import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminLogin({ onSuccess }) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email.trim(), password);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            let msg = 'লগইন ব্যর্থ হয়েছে';
            if (
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/invalid-credential'
            ) {
                msg = '❌ ভুল ইমেইল বা পাসওয়ার্ড';
            } else if (err.code === 'auth/user-not-found') {
                msg = '❌ এই ইমেইলে কোনো ইউজার নেই';
            } else if (err.code === 'auth/too-many-requests') {
                msg = '❌ অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর আবার চেষ্টা করুন';
            } else if (err.code === 'auth/invalid-email') {
                msg = '❌ ইমেইল ফরম্যাট ঠিক নেই';
            } else {
                msg = '❌ ' + err.message;
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            {error && (
                <div className="admin-error-msg show">{error}</div>
            )}

            <div className="admin-field">
                <label htmlFor="adminEmail">
                    📧 ইমেইল <span className="req">*</span>
                </label>
                <input
                    id="adminEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="username"
                    required
                />
            </div>

            <div className="admin-field">
                <label htmlFor="adminPassword">
                    🔒 পাসওয়ার্ড <span className="req">*</span>
                </label>
                <input
                    id="adminPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                />
            </div>

            <button
                type="submit"
                className="admin-submit"
                disabled={loading}
            >
                {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
            </button>
        </form>
    );
}