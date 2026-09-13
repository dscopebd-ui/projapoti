import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginAffiliate } from '../firebase/affiliates.js';
import { useAffiliate } from '../context/AffiliateContext.jsx';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function LoginPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAffiliate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginAffiliate(email.trim(), password);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            let msg = 'লগইন ব্যর্থ হয়েছে';

            if (
                err.code === 'auth/wrong-password' ||
                err.code === 'auth/invalid-credential'
            ) {
                msg = '❌ ইমেইল বা পাসওয়ার্ড ভুল';
            } else if (err.code === 'auth/user-not-found') {
                msg = '❌ এই ইমেইলে কোনো অ্যাকাউন্ট নেই';
            } else if (err.code === 'auth/too-many-requests') {
                msg = '❌ অনেকবার চেষ্টা করেছেন। কিছুক্ষণ পর চেষ্টা করুন';
            } else if (err.code === 'auth/invalid-email') {
                msg = '❌ ইমেইল ঠিক নেই';
            } else {
                msg = '❌ ' + err.message;
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header />
            </div>

            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-head">
                        <h1>🔐 লগইন করুন</h1>
                        <p>আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>ইমেইল</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                autoComplete="email"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label>পাসওয়ার্ড</label>
                            <input
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
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? '⏳ লগইন হচ্ছে...' : '✅ লগইন করুন'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        নতুন অ্যাকাউন্ট?{' '}
                        <Link to="/signup">সাইনআপ করুন</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}