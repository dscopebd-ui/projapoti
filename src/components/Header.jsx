import { SITE } from '../data/siteConfig.js';
import { useCart } from '../context/CartContext.jsx';

export default function Header({
    onCartClick,
    onMenuToggle,
    menuOpen,
    onAdminClick,
    adminLabel
}) {
    const { totalQty } = useCart();

    return (
        <header>
            <nav className="navbar">
                <a href="#" className="logo-container">
                    <div className="logo-mark">
                        <img src={SITE.logoImg} alt={`${SITE.name} Logo`} />
                    </div>
                    <div className="brand-text">
                        <h1>{SITE.name}</h1>
                        <p>{SITE.tagline}</p>
                    </div>
                </a>

                <ul className="nav-links">
                    <li><a href="#home">হোম</a></li>
                    <li><a href="#categories">ক্যাটাগরি</a></li>
                    <li><a href="#products">পণ্যসমূহ</a></li>
                    <li><a href="#contact">যোগাযোগ</a></li>
                </ul>

                <div className="navbar-right">
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