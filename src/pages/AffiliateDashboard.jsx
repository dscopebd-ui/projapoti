import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAffiliate } from '../context/AffiliateContext.jsx';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { formatPrice } from '../utils/formatPrice.js';

export default function AffiliateDashboard() {
    const navigate = useNavigate();
    const { user, isLoggedIn, loading } = useAffiliate();
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    /* Login না থাকলে login page-এ */
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, loading, navigate]);

    if (loading || !user) {
        return (
            <>
                <div className="site-top">
                    <TopBar />
                    <Header />
                </div>
                <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                    <div className="empty-msg">লোড হচ্ছে...</div>
                </div>
                <Footer />
            </>
        );
    }

    const baseUrl =
        typeof window !== 'undefined'
            ? window.location.origin
            : 'https://projapotishop.vercel.app';

    const referralLink = `${baseUrl}/?ref=${user.referralCode}`;

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(user.referralCode);
            setCopiedCode(true);
            setTimeout(() => setCopiedCode(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const handleShareFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleShareWhatsApp = () => {
        const text = `প্রজাপতি থেকে কিনুন — ১০% ছাড় পাবেন!\n${referralLink}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header />
            </div>

            <div className="dashboard-page">
                <div className="dashboard-container">
                    {/* ==========================================
                        Welcome Header
                        ========================================== */}
                    <div className="dashboard-welcome">
                        <div>
                            <h1>🎁 স্বাগতম, {user.name}!</h1>
                            <p>আপনার রেফারেল কোড শেয়ার করে কমিশন আয় করুন</p>
                        </div>
                    </div>

                    {/* ==========================================
                        Stats Overview
                        ========================================== */}
                    <div className="dashboard-stats">
                        <div className="dashboard-stat-card">
                            <div className="stat-icon">💰</div>
                            <div className="stat-value">
                                {formatPrice(user.walletBalance || 0)}
                            </div>
                            <div className="stat-label">ওয়ালেট ব্যালেন্স</div>
                        </div>

                        <div className="dashboard-stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-value">
                                {user.totalReferrals || 0}
                            </div>
                            <div className="stat-label">মোট রেফারেল</div>
                        </div>

                        <div className="dashboard-stat-card">
                            <div className="stat-icon">🛒</div>
                            <div className="stat-value">
                                {user.totalOrders || 0}
                            </div>
                            <div className="stat-label">মোট অর্ডার</div>
                        </div>

                        <div className="dashboard-stat-card">
                            <div className="stat-icon">📈</div>
                            <div className="stat-value">
                                {formatPrice(user.totalEarnings || 0)}
                            </div>
                            <div className="stat-label">মোট আয়</div>
                        </div>
                    </div>

                    {/* ==========================================
                        Referral Code
                        ========================================== */}
                    <div className="dashboard-card">
                        <h2 className="dashboard-card-title">
                            🔑 আপনার রেফারেল কোড
                        </h2>
                        <div className="referral-code-box">
                            <div className="referral-code">
                                {user.referralCode}
                            </div>
                            <button
                                type="button"
                                className="referral-copy-btn"
                                onClick={handleCopyCode}
                            >
                                {copiedCode ? '✅ কপি হয়েছে' : '📋 কপি করুন'}
                            </button>
                        </div>
                    </div>

                    {/* ==========================================
                        Referral Link
                        ========================================== */}
                    <div className="dashboard-card">
                        <h2 className="dashboard-card-title">
                            🔗 আপনার শেয়ার লিংক
                        </h2>
                        <div className="referral-link-box">
                            <div className="referral-link">
                                {referralLink}
                            </div>
                            <button
                                type="button"
                                className="referral-copy-btn"
                                onClick={handleCopyLink}
                            >
                                {copiedLink ? '✅ কপি হয়েছে' : '📋 কপি করুন'}
                            </button>
                        </div>

                        <div className="share-buttons">
                            <button
                                type="button"
                                className="share-btn share-facebook"
                                onClick={handleShareFacebook}
                            >
                                📘 Facebook-এ শেয়ার করুন
                            </button>
                            <button
                                type="button"
                                className="share-btn share-whatsapp"
                                onClick={handleShareWhatsApp}
                            >
                                💬 WhatsApp-এ শেয়ার করুন
                            </button>
                        </div>
                    </div>

                    {/* ==========================================
                        How It Works
                        ========================================== */}
                    <div className="dashboard-card">
                        <h2 className="dashboard-card-title">
                            🎯 কীভাবে কাজ করে?
                        </h2>
                        <div className="how-it-works">
                            <div className="step">
                                <div className="step-number">১</div>
                                <div className="step-text">
                                    আপনার লিংক বন্ধুদের সাথে শেয়ার করুন
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">২</div>
                                <div className="step-text">
                                    বন্ধু ১০% ছাড়ে কেনাকাটা করবে
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">৩</div>
                                <div className="step-text">
                                    আপনি ৫% কমিশন পাবেন
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">৪</div>
                                <div className="step-text">
                                    ওয়ালেটে টাকা জমা হবে — কিনতে বা উইথড্র করতে পারবেন
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                        Link to Shop
                        ========================================== */}
                    <div className="dashboard-cta">
                        <Link to="/" className="dashboard-shop-btn">
                            🛍️ কেনাকাটা করুন
                        </Link>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}