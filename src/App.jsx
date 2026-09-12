import { useState, useEffect } from 'react';
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
import { useAuth } from './context/AuthContext.jsx';
import { useProducts } from './context/ProductContext.jsx';

export default function App() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeCat, setActiveCat] = useState('সব');
    const [detailId, setDetailId] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [adminOpen, setAdminOpen] = useState(false);

    const { user } = useAuth();
    const { products, loading } = useProducts();

    /* ---------- URL থেকে প্রোডাক্ট id ---------- */
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('product');
        if (id) setDetailId(Number(id));

        const handlePop = () => {
            const p = new URLSearchParams(window.location.search);
            const pid = p.get('product');
            setDetailId(pid ? Number(pid) : null);
        };
        window.addEventListener('popstate', handlePop);
        return () => window.removeEventListener('popstate', handlePop);
    }, []);

    const openDetail = (id) => {
        setDetailId(id);
        const url = new URL(window.location.href);
        url.searchParams.set('product', id);
        window.history.pushState({ productId: id }, '', url);
        setTimeout(() => {
            document
                .getElementById('productDetail')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const closeDetail = () => {
        setDetailId(null);
        const url = new URL(window.location.href);
        url.searchParams.delete('product');
        window.history.replaceState(null, '', url);
        setTimeout(() => {
            document
                .getElementById('products')
                ?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const selectCat = (id) => {
        setActiveCat(id);
        setTimeout(() => {
            document
                .getElementById('products')
                ?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    const openCart = () => setCartOpen(true);
    const closeCart = () => setCartOpen(false);

    const openCheckout = () => {
        setCartOpen(false);
        setCheckoutOpen(true);
    };
    const closeCheckout = () => setCheckoutOpen(false);

    const openAdmin = () => setAdminOpen(true);
    const closeAdmin = () => setAdminOpen(false);

    const handleBuyNow = () => {
        setCheckoutOpen(true);
    };

    const detailProduct =
        detailId !== null
            ? products.find(
                  (p) =>
                      Number(p.id) === Number(detailId) ||
                      p.firebaseDocId === String(detailId)
              )
            : null;

    return (
        <>
            <div className="site-top">
                <TopBar />
                <Header
                    onCartClick={openCart}
                    onMenuToggle={() => setMenuOpen(!menuOpen)}
                    menuOpen={menuOpen}
                    onAdminClick={openAdmin}
                    adminLabel={user ? 'Admin' : 'Login'}
                />
                <MobileNav
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                />
            </div>

            <Banner />

            <div className="container">
                {detailProduct ? (
                    <ProductDetail
                        product={detailProduct}
                        onBack={closeDetail}
                        onBuyNow={handleBuyNow}
                    />
                ) : (
                    <>
                        <CategoryGrid
                            activeCat={activeCat}
                            onSelect={selectCat}
                        />

                        <div id="products" style={{ marginTop: '3rem' }}>
                            <h2 className="section-title">
                                আমাদের পণ্যসমূহ
                            </h2>
                            <ProductGrid
                                products={products}
                                activeCat={activeCat}
                                onOpenDetail={openDetail}
                                loading={loading}
                            />
                        </div>
                    </>
                )}
            </div>

            <Footer />

            <CartDrawer
                open={cartOpen}
                onClose={closeCart}
                onCheckout={openCheckout}
            />

            <CheckoutModal
                open={checkoutOpen}
                onClose={closeCheckout}
            />

            <AdminPanel open={adminOpen} onClose={closeAdmin} />
        </>
    );
}