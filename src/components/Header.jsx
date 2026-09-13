import { useNavigate, Link } from 'react-router-dom';
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

    /* 🆕 অ্যাডমিন হলে কাস্টমার UI দেখাবে না */
    const showCustomerUI = isAffiliateLoggedIn && !isAdminLoggedIn;

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
                        🎁 Customer Dashboard — শুধু Customer-এর জন্য
                        ========================================== */}
                    {showCustomerUI && (
                        <>
                            <Link
                                to="/dashboard"
                                className="affiliate-btn-logged"
                                title={affiliateUser?.name || 'ড্যাশবোর্ড'}
                            >
                                🎁 {affiliateFirstName}
                            </Link>

                            <button
                                type="button"
                                className="affiliate-logout-btn"
                                onClick={handleAffiliateLogout}
                                title="লগআউট করুন"
                            >
                                🚪 লগআউট
                            </button>
                        </>
                    )}

                    {/* ==========================================
                        🎁 Signup Button — শুধু কেউ লগইন না থাকলে
                        ========================================== */}
                    {!isAffiliateLoggedIn && !isAdminLoggedIn && (
                        <Link
                            to="/signup"
                            className="affiliate-btn-signup"
                            title="রেফার করে আয় করুন"
                        >
                            🎁 রেফার করে আয়
                        </Link>
                    )}

                    {/* ==========================================
                        🔐 Login Button — Admin লগইন না থাকলে
                        ========================================== */}
                    {!isAdminLoggedIn && (
                        <button
                            className="admin-btn"
                            type="button"
                            onClick={onAdminClick}
                        >
                            🔐 <span>{adminLabel}</span>
                        </button>
                    )}

                    {/* ==========================================
                        ⚙️ Admin Dashboard — Admin লগইন থাকলে
                        ========================================== */}
                    {isAdminLoggedIn && (
                        <button
                            className="admin-btn admin-dashboard-btn"
                            type="button"
                            onClick={onAdminClick}
                            title="Admin Dashboard"
                        >
                            ⚙️ Dashboard
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