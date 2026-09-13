import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { formatPrice, getDiscountPercent } from '../utils/formatPrice.js';
import { useSEO } from '../hooks/useSEO.js';
import ReviewList from './ReviewList.jsx';
import ReviewForm from './ReviewForm.jsx';

export default function ProductDetail() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { products, loading } = useProducts();
    const { addToCart } = useCart();

    const productId = slug ? slug.split('-').pop() : null;

    const product = products.find(
        (p) => String(p.id) === String(productId)
    );

    /* SEO */
    useSEO({
        title: product ? product.name : 'প্রোডাক্ট',
        description: product
            ? `${product.name} — ${product.desc || ''} | ৳${product.price} | প্রজাপতি`.slice(0, 160)
            : 'প্রজাপতি — অনলাইন শপ',
        image: product?.img,
        url: product ? `/product/${slug}` : '/'
    });

    /* Product Schema */
    useEffect(() => {
        if (!product) return;

        const imgs =
            product.images && product.images.length
                ? product.images
                : [product.img].filter(Boolean);

        const schema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.desc || '',
            image: imgs,
            category: product.cat,
            brand: { '@type': 'Brand', name: 'প্রজাপতি' },
            offers: {
                '@type': 'Offer',
                url: `https://projapotishop.vercel.app/product/${slug}`,
                priceCurrency: 'BDT',
                price: product.price,
                availability: 'https://schema.org/InStock',
                seller: { '@type': 'Organization', name: 'প্রজাপতি' }
            }
        };

        const old = document.getElementById('product-schema');
        if (old) old.remove();

        const script = document.createElement('script');
        script.id = 'product-schema';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(schema);
        document.head.appendChild(script);

        return () => {
            const el = document.getElementById('product-schema');
            if (el) el.remove();
        };
    }, [product, slug]);

    if (loading) {
        return (
            <div className="container" style={{ padding: '3rem 0' }}>
                <div className="empty-msg">প্রোডাক্ট লোড হচ্ছে...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
                <h2 style={{ color: '#6b1d8e', marginBottom: 12 }}>
                    প্রোডাক্ট পাওয়া যায়নি
                </h2>
                <p style={{ color: '#888', marginBottom: 20 }}>
                    এই প্রোডাক্টটি সাইটে নেই বা সরিয়ে ফেলা হয়েছে।
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

    const imgs =
        product.images && product.images.length
            ? product.images
            : [product.img].filter(Boolean);

    const discount = getDiscountPercent(product.price, product.oldPrice);

    return (
        <div className="container">
            <div className="detail-page active" id="productDetail">
                <button
                    type="button"
                    className="detail-back"
                    onClick={() => navigate('/')}
                >
                    ✕ বন্ধ করুন
                </button>

                <div className="detail-hero">
                    <div>
                        <img
                            src={imgs[0]}
                            alt={`${product.name} — ${product.cat} — প্রজাপতি`}
                            title={product.name}
                            className="detail-gallery-main"
                        />

                        {imgs.length > 1 && (
                            <div className="detail-thumbs">
                                {imgs.map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        className={`detail-thumb ${i === 0 ? 'active' : ''}`}
                                        alt={`${product.name} - ছবি ${i + 1}`}
                                        onClick={(e) => {
                                            document.querySelector('.detail-gallery-main').src = src;
                                            document
                                                .querySelectorAll('.detail-thumb')
                                                .forEach((x) => x.classList.remove('active'));
                                            e.target.classList.add('active');
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="detail-info">
                        <h1 style={{ fontSize: '1.6rem', color: '#222', marginBottom: 12 }}>
                            {product.name}
                        </h1>

                        {discount > 0 && (
                            <div>
                                <span className="discount-badge">
                                    {discount}% ছাড়
                                </span>
                            </div>
                        )}

                        <p className="detail-desc">{product.desc || ''}</p>

                        <div className="detail-price-box">
                            {product.oldPrice > product.price && (
                                <span className="old-price">
                                    ৳ {product.oldPrice}
                                </span>
                            )}
                            <span className="price">
                                {formatPrice(product.price)}
                            </span>
                        </div>

                        <div className="detail-cta-row">
                            <button
                                className="btn-add"
                                type="button"
                                onClick={() => addToCart(product.id, 1)}
                            >
                                কার্টে যোগ করুন
                            </button>
                            <button
                                className="btn-buy"
                                type="button"
                                onClick={() => {
                                    addToCart(product.id, 1);
                                    navigate('/checkout');
                                }}
                            >
                                এখনই কিনুন
                            </button>
                        </div>

                        {product.benefits && product.benefits.length > 0 && (
                            <div className="detail-benefits">
                                {product.benefits.map((b, i) => (
                                    <div key={i} className="detail-benefit-item">
                                        <span className="tick">✔</span>
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ================================================
                    REVIEWS SECTION
                    ================================================ */}
                <div className="reviews-section">
                    <h2 className="section-title" style={{ textAlign: 'left' }}>
                        ⭐ কাস্টমার রিভিউ
                    </h2>

                    <ReviewList productId={product.id} />

                    <ReviewForm
                        productId={product.id}
                        productName={product.name}
                    />
                </div>
            </div>
        </div>
    );
}