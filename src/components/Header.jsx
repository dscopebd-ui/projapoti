import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SITE } from '../data/siteConfig.js';
import { useCart } from '../context/CartContext.jsx';
import { useAffiliate } from '../context/AffiliateContext.jsx';
import SearchBar from './SearchBar.jsx';

export default function Header({
    onCartClick,
    onMenuToggle,
    menuOpen,
    onAdminClick,
    adminLabel
}) {
    const navigate = useNavigate();
    const { totalQty } = useCart();
    const { user: affiliateUser, isLoggedIn: isAffiliateLoggedIn, logout } = useAffiliate();

    const affiliateFirstName =
        affiliateUser?.name?.trim()?.split(' ')[0] || 'Dashboard';

    const isAdminLoggedIn = adminLabel === 'Admin';

    /* 🆕 সরাসরি লগআউট */
    const handleAffiliateLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <header>
            <nav className="navbar">
                <Link to="/" className="logo-container">
                    <div className="logo-mark">
                        <img src={SITE.logoImg} alt={`${SITE.name} Logo`} />
                    </div>
                    <div className="brand-text">
                        <h1>{SITE.name}</h1>
                        <p>{SITE.tagline}</p>
                    </div>
                </Link>

                <ul className="nav-links">
                    <li><Link to="/">হোম</Link></li>
                    <li><a href="/#categories">ক্যাটাগরি</a></li>
                    <li><a href="/#products">পণ্যসমূহ</a></li>
                    <li><a href="/#contact">যোগাযোগ</a></li>
                </ul>

                <div className="navbar-right">
                    <SearchBar />

                    {/* ==========================================
                        🎁 কাস্টমার — নাম (ড্যাশবোর্ড লিংক)
                        ========================================== */}
                    {isAffiliateLoggedIn ? (
                        <Link
                            to="/dashboard"
                            className="affiliate-btn-logged"
                            title={affiliateUser?.name || 'ড্যাশবোর্ড'}
                        >
                            🎁 {affiliateFirstName}
                        </Link>
                    ) : (
                        <Link
                            to="/signup"
                            className="affiliate-btn-signup"
                            title="রেফার করে আয় করুন"
                        >
                            🎁 রেফার করে আয়
                        </Link>
                    )}

                    {/* ==========================================
                        🆕 সরাসরি লগআউট বাটন (কাস্টমার লগইন থাকলে)
                        ========================================== */}
                    {isAffiliateLoggedIn && (
                        <button
                            type="button"
                            className="affiliate-logout-btn"
                            onClick={handleAffiliateLogout}
                            title="লগআউট করুন"
                        >
                            🚪 লগআউট
                        </button>
                    )}

                    {/* ==========================================
                        🔐 Admin — শুধু কাস্টমার লগইন না থাকলে
                        ========================================== */}
                    {!isAffiliateLoggedIn && (
                        <button
                            className="admin-btn"
                            type="button"
                            onClick={onAdminClick}
                        >
                            🔐 <span>{adminLabel}</span>
                        </button>
                    )}

                    {isAdminLoggedIn && (
                        <button
                            className="admin-btn logged-in"
                            type="button"
                            onClick={onAdminClick}
                            title="Admin Panel বন্ধ করুন"
                        >
                            🔐 Admin
                        </button>
                    )}

                    <button
                        className="cart-btn"
                        type="button"
                        onClick={onCartClick}
                    >
                        🛒 কার্ট (<span>{totalQty}</span>)
                    </button>

                    <button
                        className={`menu-toggle ${menuOpen ? 'open' : ''}`}
                        type="button"
                        onClick={onMenuToggle}
                        aria-label="মেনু"
                    >
                        <span></span>
                    </button>
                </div>
            </nav>
        </header>
    );
}