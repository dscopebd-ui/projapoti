import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../data/siteConfig.js';
import { useCart } from '../context/CartContext.jsx';
import SearchBar from './SearchBar.jsx';
import {
    listenApprovedReviews,
    calcOverallRating
} from '../firebase/reviews.js';

export default function Header({
    onCartClick,
    onMenuToggle,
    menuOpen,
    onAdminClick,
    adminLabel
}) {
    const { totalQty } = useCart();
    const [rating, setRating] = useState({ average: 0, count: 0 });

    useEffect(() => {
        const unsub = listenApprovedReviews(
            (list) => {
                setRating(calcOverallRating(list));
            },
            () => {}
        );
        return () => unsub();
    }, []);

    /* ব্যাজ দেখাবো যদি কমপক্ষে 1টি রিভিউ থাকে */
    const showRating = rating.count >= 1;

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
                        {showRating && (
                            <div className="header-rating-badge">
                                <span className="header-rating-star">★</span>
                                <strong>{rating.average.toFixed(1)}</strong>
                                <span className="header-rating-count">
                                    ({rating.count})
                                </span>
                            </div>
                        )}
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

                    <button
                        className="admin-btn"
                        type="button"
                        onClick={onAdminClick}
                    >
                        🔐 <span>{adminLabel}</span>
                    </button>

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