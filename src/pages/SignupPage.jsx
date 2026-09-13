import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupAffiliate } from '../firebase/affiliates.js';
import { getSavedReferral } from '../firebase/affiliates.js';
import { useAffiliate } from '../context/AffiliateContext.jsx';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function SignupPage() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAffiliate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [referralCode, setReferralCode] = useState(null);

    /* Referral code চেক */
    useEffect(() => {
        const ref = getSavedReferral();
        setReferralCode(ref);
    }, []);

    /* Already logged in? */
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/dashboard');
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        /* Validation */
        if (!name.trim() || name.trim().length < 2) {
            setError('নাম কমপক্ষে ২ অক্ষরের হতে হবে');
            return;
        }
        if (!phone.trim() || phone.trim().length < 11) {
            setError('সঠিক ফোন নম্বর দিন');
            return;
        }
        if (!email.trim() || !email.includes('@')) {
            setError('সঠিক ইমেইল দিন');
            return;
        }
        if (password.length < 6) {
            setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
            return;
        }
        if (password !== confirmPassword) {
            setError('পাসওয়ার্ড দুইবার একই দিতে হবে');
            return;
        }

        setLoading(true);

        try {
            await signupAffiliate({
                name: name.trim(),
                phone: phone.trim(),
                email: email.trim().toLowerCase(),
                password,
                referredBy: referralCode
            });

            /* সফল → ড্যাশবোর্ডে */
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            let msg = 'সাইনআপ করতে সমস্যা হয়েছে';

            if (err.code === 'auth/email-already-in-use') {
                msg = 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে';
            } else if (err.code === 'auth/invalid-email') {
                msg = 'ইমেইল ঠিক নেই';
            } else if (err.code === 'auth/weak-password') {
                msg = 'পাসওয়ার্ড দুর্বল';
            } else {
                msg = err.message || msg;
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
                        <h1>🎁 সাইনআপ করুন</h1>
                        <p>রেফার করে আয় করুন — বন্ধুকে ছাড়, আপনাকে কমিশন</p>
                    </div>

                    {referralCode && (
                        <div className="referral-notice">
                            🎉 আপনি <b>{referralCode}</b> এর রেফারেলে এসেছেন!
                            <br />
                            অর্ডারে বিশেষ ছাড় পাবেন।
                        </div>
                    )}

                    {error && (
                        <div className="auth-error">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="auth-field">
                            <label>পুরো নাম *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="আপনার নাম"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label>ফোন নম্বর *</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                maxLength={15}
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label>ইমেইল *</label>
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
                            <label>পাসওয়ার্ড *</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="কমপক্ষে ৬ অক্ষর"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="auth-field">
                            <label>পাসওয়ার্ড আবার *</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="আবার লিখুন"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? '⏳ সাইনআপ হচ্ছে...' : '✅ সাইনআপ করুন'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        আগে থেকেই অ্যাকাউন্ট আছে?{' '}
                        <Link to="/login">লগইন করুন</Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}