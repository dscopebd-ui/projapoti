import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import MobileNav from '../components/MobileNav.jsx';
import Banner from '../components/Banner.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSEO } from '../hooks/useSEO.js';

/* বাংলা সংখ্যা → ইংরেজি সংখ্যা */
function toEnglishDigits(str) {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(str).replace(/[০-৯]/g, (d) => banglaDigits.indexOf(d));
}

/* প্রোডাক্টে সার্চ */
function searchProducts(products, query) {
    if (!query || query.trim().length < 2) return [];

    const q = query.trim().toLowerCase();
    const qEng = toEnglishDigits(q);

    return products.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const cat = (p.cat || '').toLowerCase();
        const desc = (p.desc || '').toLowerCase();
        const price = String(p.price || '');
        const priceEng = toEnglishDigits(price);

        /* নাম, ক্যাটাগরি, বিবরণ, দাম — সব খুঁজে */
        return (
            name.includes(q) ||
            cat.includes(q) ||
            desc.includes(q) ||
            priceEng.includes(qEng)
        );
    });
}

export default function SearchPage({ onOpenCart, onOpenAdmin }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [input, setInput] = useState(searchParams.get('q') || '');

    const query = searchParams.get('q') || '';

    /* URL-এ query পরিবর্তন হলে input আপডেট */
    useEffect(() => {
        setInput(query);
    }, [query]);

    /* Search results */
    const results = useMemo(
        () => searchProducts(products, query),
        [products, query]
    );

    /* SEO */
    useSEO({
        title: query ? `"${query}" — সার্চ ফলাফল` : 'সার্চ',
        description: query
            ? `"${query}" এর জন্য ${results.length}টি প্রোডাক্ট পাওয়া গেছে | প্রজাপতি`
            : 'প্রজাপতি — প্রোডাক্ট সার্চ',
        url: `/search?q=${encodeURIComponent(query)}`
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = input.trim();
        if (!q) return;
        setSearchParams({ q });
    };

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header
                    onCartClick={onOpenCart}
                    onMenuToggle={() => setMenuOpen(!menuOpen)}
                    menuOpen={menuOpen}
                    onAdminClick={onOpenAdmin}
                    adminLabel={user ? 'Admin' : 'Login'}
                />
                <MobileNav
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            </div>

            <Banner />

            <div className="container">
                {/* Breadcrumb */}
                <nav
                    style={{
                        fontSize: '0.85rem',
                        color: '#888',
                        marginBottom: '1.5rem'
                    }}
                >
                    <Link to="/" style={{ color: '#6b1d8e' }}>
                        হোম
                    </Link>
                    {' / '}
                    <span>সার্চ</span>
                </nav>

                {/* Search Input (বড়) */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: 'flex',
                        gap: '10px',
                        maxWidth: '600px',
                        marginBottom: '2rem'
                    }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="প্রোডাক্টের নাম, ক্যাটাগরি বা দাম লিখুন..."
                        autoFocus
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            borderRadius: '25px',
                            border: '2px solid #e0d5e8',
                            fontSize: '1rem',
                            fontFamily: 'inherit',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn-add"
                        style={{
                            padding: '12px 24px',
                            borderRadius: '25px',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        🔍 খুঁজুন
                    </button>
                </form>

                {/* Results */}
                {loading ? (
                    <div className="empty-msg">প্রোডাক্ট লোড হচ্ছে...</div>
                ) : !query ? (
                    <div className="empty-msg">
                        কিছু লিখে খুঁজুন...
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-msg">
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>
                            🔍
                        </div>
                        <h3
                            style={{
                                color: '#6b1d8e',
                                marginBottom: 8
                            }}
                        >
                            "{query}" এর জন্য কিছু পাওয়া যায়নি
                        </h3>
                        <p style={{ color: '#888', marginBottom: 20 }}>
                            অন্য শব্দ দিয়ে চেষ্টা করুন
                        </p>
                        <button
                            type="button"
                            className="btn-details"
                            style={{ maxWidth: 200, margin: '0 auto' }}
                            onClick={() => navigate('/')}
                        >
                            হোমে ফিরে যান
                        </button>
                    </div>
                ) : (
                    <>
                        <h2
                            className="section-title"
                            style={{ textAlign: 'left' }}
                        >
                            "{query}" এর জন্য {results.length}টি ফলাফল
                        </h2>

                        <div className="product-grid">
                            {results.map((p) => (
                                <ProductCard
                                    key={p.firebaseDocId || p.id}
                                    product={p}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </>
    );
}