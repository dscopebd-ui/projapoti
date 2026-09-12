import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import TopBar from '../components/TopBar.jsx';
import Header from '../components/Header.jsx';
import MobileNav from '../components/MobileNav.jsx';
import Banner from '../components/Banner.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { categories, getCategoryBySlug } from '../data/categories.js';
import { useSEO } from '../hooks/useSEO.js';
import { useState } from 'react';

export default function CategoryPage({ onOpenCart, onOpenAdmin }) {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { user } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    const category = getCategoryBySlug(slug);

    /* প্রোডাক্ট ফিল্টার */
    const categoryProducts = category
        ? products.filter(p => p.cat === category.id)
        : [];

    /* SEO */
    useSEO({
        title: category
            ? `${category.label} — অনলাইন শপ`
            : 'ক্যাটাগরি',
        description: category
            ? `${category.description} | প্রজাপতি — সারা বাংলাদেশে হোম ডেলিভারি`
            : 'প্রজাপতি — অনলাইন শপ',
        url: category ? `/category/${slug}` : '/'
    });

    /* Structured Data */
    useEffect(() => {
        if (!category) return;

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: category.label,
            description: category.description,
            url: `https://projapotishop.vercel.app/category/${slug}`,
            hasPart: categoryProducts.slice(0, 20).map(p => ({
                '@type': 'Product',
                name: p.name,
                url: `https://projapotishop.vercel.app/product/${p.id}`
            }))
        };

        const old = document.getElementById('category-schema');
        if (old) old.remove();

        const script = document.createElement('script');
        script.id = 'category-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const el = document.getElementById('category-schema');
            if (el) el.remove();
        };
    }, [category, slug, categoryProducts]);

    /* ক্যাটাগরি নেই */
    if (!category) {
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

                <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#6b1d8e', marginBottom: 12 }}>
                        ক্যাটাগরি পাওয়া যায়নি
                    </h2>
                    <p style={{ color: '#888', marginBottom: 24 }}>
                        এই ক্যাটাগরিটি নেই বা সরিয়ে ফেলা হয়েছে।
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

                <Footer />
            </>
        );
    }

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
                    <span>{category.label}</span>
                </nav>

                {/* Category Title */}
                <h1
                    className="section-title"
                    style={{ textAlign: 'left', fontSize: '1.8rem' }}
                >
                    {category.icon} {category.label}
                </h1>

                <p
                    style={{
                        color: '#666',
                        marginBottom: '2rem',
                        maxWidth: '600px'
                    }}
                >
                    {category.description}
                </p>

                {/* Products */}
                {loading ? (
                    <div className="empty-msg">প্রোডাক্ট লোড হচ্ছে...</div>
                ) : categoryProducts.length === 0 ? (
                    <div className="empty-msg">
                        এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।
                    </div>
                ) : (
                    <div className="product-grid">
                        {categoryProducts.map(p => (
                            <ProductCard
                                key={p.firebaseDocId || p.id}
                                product={p}
                            />
                        ))}
                    </div>
                )}

                {/* Other Categories */}
                <div style={{ marginTop: '4rem' }}>
                    <h2 className="section-title">অন্য ক্যাটাগরি</h2>
                    <div className="category-grid">
                        {categories
                            .filter(c => c.slug !== slug)
                            .map(c => (
                                <Link
                                    key={c.id}
                                    to={`/category/${c.slug}`}
                                    className="category-card"
                                >
                                    <span className="category-icon">
                                        {c.icon}
                                    </span>
                                    <strong>{c.label}</strong>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}