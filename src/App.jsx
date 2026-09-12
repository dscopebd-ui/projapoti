import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar.jsx';
import Header from './components/Header.jsx';
import MobileNav from './components/MobileNav.jsx';
import Banner from './components/Banner.jsx';
import CategoryGrid from './components/CategoryGrid.jsx';
import ProductGrid from './components/ProductGrid.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import Footer from './components/Footer.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useProducts } from './context/ProductContext.jsx';

function HomePage({ onOpenCart, onOpenAdmin, adminLabel }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const { products, loading } = useProducts();

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header
                    onCartClick={onOpenCart}
                    onMenuToggle={() => setMenuOpen(!menuOpen)}
                    menuOpen={menuOpen}
                    onAdminClick={onOpenAdmin}
                    adminLabel={adminLabel}
                />
                <MobileNav
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            </div>

            <Banner />

            <div className="container">
                <CategoryGrid />

                <div id="products" style={{ marginTop: '3rem' }}>
                    <h2 className="section-title">আমাদের পণ্যসমূহ</h2>
                    <ProductGrid
                        products={products}
                        activeCat="সব"
                        loading={loading}
                    />
                </div>
            </div>

            <Footer />
        </>
    );
}

function CheckoutPage({ onOpenCart, onOpenAdmin, adminLabel }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(true);
    const navigate = useNavigate();

    const handleClose = () => {
        setCheckoutOpen(false);
        navigate('/');
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
                    adminLabel={adminLabel}
                />
                <MobileNav
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            </div>

            <Banner />

            <div className="container" style={{ minHeight: '60vh' }}>
                <CheckoutModal
                    open={checkoutOpen}
                    onClose={handleClose}
                />
            </div>

            <Footer />
        </>
    );
}

function ProductDetailPage({ onOpenCart, onOpenAdmin, adminLabel }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header
                    onCartClick={onOpenCart}
                    onMenuToggle={() => setMenuOpen(!menuOpen)}
                    menuOpen={menuOpen}
                    onAdminClick={onOpenAdmin}
                    adminLabel={adminLabel}
                />
                <MobileNav
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            </div>

            <ProductDetail />

            <Footer />
        </>
    );
}

function NotFound() {
    const navigate = useNavigate();
    return (
        <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', color: '#6b1d8e', marginBottom: 12 }}>
                404
            </h1>
            <h2 style={{ color: '#333', marginBottom: 12 }}>
                পেজটি খুঁজে পাওয়া যায়নি
            </h2>
            <p style={{ color: '#888', marginBottom: 24 }}>
                আপনি যে পেজটি খুঁজছেন সেটি নেই।
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
    );
}

export default function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    const openCart = () => setCartOpen(true);
    const closeCart = () => setCartOpen(false);
    const openAdmin = () => setAdminOpen(true);
    const closeAdmin = () => setAdminOpen(false);

    const adminLabel = user ? 'Admin' : 'Login';

    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomePage
                            onOpenCart={openCart}
                            onOpenAdmin={openAdmin}
                            adminLabel={adminLabel}
                        />
                    }
                />

                <Route
                    path="/category/:slug"
                    element={
                        <CategoryPage
                            onOpenCart={openCart}
                            onOpenAdmin={openAdmin}
                        />
                    }
                />

                <Route
                    path="/search"
                    element={
                        <SearchPage
                            onOpenCart={openCart}
                            onOpenAdmin={openAdmin}
                        />
                    }
                />

                <Route
                    path="/product/:slug"
                    element={
                        <ProductDetailPage
                            onOpenCart={openCart}
                            onOpenAdmin={openAdmin}
                            adminLabel={adminLabel}
                        />
                    }
                />

                <Route
                    path="/checkout"
                    element={
                        <CheckoutPage
                            onOpenCart={openCart}
                            onOpenAdmin={openAdmin}
                            adminLabel={adminLabel}
                        />
                    }
                />

                <Route path="*" element={<NotFound />} />
            </Routes>

            <CartDrawer open={cartOpen} onClose={closeCart} />
            <AdminPanel open={adminOpen} onClose={closeAdmin} />
        </>
    );
}