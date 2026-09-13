import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAffiliate } from '../context/AffiliateContext.jsx';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import WithdrawModal from '../components/WithdrawModal.jsx';
import { formatPrice } from '../utils/formatPrice.js';
import {
    listenUserWithdrawals
} from '../firebase/withdrawals.js';
import { getSettings } from '../firebase/settings.js';

export default function AffiliateDashboard() {
    const navigate = useNavigate();
    const { user, isLoggedIn, loading } = useAffiliate();
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawals, setWithdrawals] = useState([]);
    const [settings, setSettings] = useState({
        minWithdrawal: 50,
        customerDiscountPercent: 10,
        referrerCommissionPercent: 5
    });

    /* Login না থাকলে */
    useEffect(() => {
        if (!loading && !isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, loading, navigate]);

    /* Settings লোড */
    useEffect(() => {
        getSettings().then(setSettings);
    }, []);

    /* Withdrawals লিসেন */
    useEffect(() => {
        if (!user?.uid) return;

        const unsub = listenUserWithdrawals(
            user.uid,
            (list) => setWithdrawals(list),
            () => {}
        );
        return () => unsub();
    }, [user?.uid]);

    if (loading || !user) {
        return (
            <>
                <div className="site-top">
                    <TopBar />
                    <Header />
                </div>
                <div
                    className="container"
                    style={{ padding: '5rem 1rem', textAlign: 'center' }}
                >
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
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            referralLink
        )}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleShareWhatsApp = () => {
        const text = `প্রজাপতি থেকে কিনুন — ${settings.customerDiscountPercent}% ছাড় পাবেন!\n${referralLink}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const statusLabels = {
        pending: '⏳ অপেক্ষমাণ',
        approved: '✅ অনুমোদিত',
        rejected: '❌ বাতিল'
    };

    const statusColors = {
        pending: '#ff9800',
        approved: '#16833b',
        rejected: '#b71c1c'
    };

    const canWithdraw = (user.walletBalance || 0) >= settings.minWithdrawal;

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header />
            </div>

            <div className="dashboard-page">
                <div className="dashboard-container">
                    {/* Welcome */}
                    <div className="dashboard-welcome">
                        <div>
                            <h1>🎁 স্বাগতম, {user.name}!</h1>
                            <p>আপনার রেফারেল কোড শেয়ার করে কমিশন আয় করুন</p>
                        </div>
                    </div>

                    {/* Stats */}
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

                    {/* Withdraw Section */}
                    <div className="dashboard-card dashboard-withdraw-card">
                        <div className="withdraw-header-row">
                            <div>
                                <h2 className="dashboard-card-title" style={{ marginBottom: 4 }}>
                                    💸 টাকা তুলুন
                                </h2>
                                <p className="withdraw-sub-text">
                                    বিকাশ / নগদ / রকেটে টাকা তুলুন (সর্বনিম্ন {formatPrice(settings.minWithdrawal)})
                                </p>
                            </div>
                            <button
                                type="button"
                                className="withdraw-main-btn"
                                onClick={() => setWithdrawOpen(true)}
                                disabled={!canWithdraw}
                            >
                                {canWithdraw ? '💸 উইথড্র করুন' : '❌ পর্যাপ্ত টাকা নেই'}
                            </button>
                        </div>
                    </div>

                    {/* Withdraw History */}
                    {withdrawals.length > 0 && (
                        <div className="dashboard-card">
                            <h2 className="dashboard-card-title">
                                📋 উইথড্র হিস্ট্রি
                            </h2>
                            <div className="withdraw-history-list">
                                {withdrawals.map((w) => (
                                    <div
                                        key={w.id}
                                        className="withdraw-history-item"
                                    >
                                        <div className="withdraw-history-left">
                                            <div className="withdraw-history-amount">
                                                {formatPrice(w.amount)}
                                            </div>
                                            <div className="withdraw-history-method">
                                                {METHOD_LABELS[w.method] || w.method} • {w.phoneNumber}
                                            </div>
                                            <div className="withdraw-history-date">
                                                {formatDate(w.requestedAt)}
                                            </div>
                                        </div>
                                        <div
                                            className="withdraw-history-status"
                                            style={{
                                                color: statusColors[w.status]
                                            }}
                                        >
                                            {statusLabels[w.status] || w.status}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Referral Code */}
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

                    {/* Referral Link */}
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

                    {/* How It Works */}
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
                                    বন্ধু {settings.customerDiscountPercent}% ছাড়ে কেনাকাটা করবে
                                </div>
                            </div>
                            <div className="step">
                                <div className="step-number">৩</div>
                                <div className="step-text">
                                    আপনি {settings.referrerCommissionPercent}% কমিশন পাবেন
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

                    {/* Shop CTA */}
                    <div className="dashboard-cta">
                        <Link to="/" className="dashboard-shop-btn">
                            🛍️ কেনাকাটা করুন
                        </Link>
                    </div>
                </div>
            </div>

            <WithdrawModal
                open={withdrawOpen}
                onClose={() => setWithdrawOpen(false)}
                walletBalance={user.walletBalance || 0}
                minWithdrawal={settings.minWithdrawal}
            />

            <Footer />
        </>
    );
}

const METHOD_LABELS = {
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট'
};