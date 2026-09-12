import { useCart } from '../context/CartContext.jsx';
import { formatPrice, getDiscountPercent } from '../utils/formatPrice.js';

export default function ProductDetail({ product, onBack, onBuyNow }) {
    const { addToCart } = useCart();

    if (!product) return null;

    const imgs =
        product.images && product.images.length
            ? product.images
            : [product.img].filter(Boolean);

    const discount = getDiscountPercent(product.price, product.oldPrice);

    return (
        <div className="detail-page active" id="productDetail">
            <button
                type="button"
                className="detail-back"
                onClick={onBack}
            >
                ✕ বন্ধ করুন
            </button>

            <div className="detail-hero">
                <div>
                    <img
                        src={imgs[0]}
                        alt={product.name}
                        className="detail-gallery-main"
                    />

                    {imgs.length > 1 && (
                        <div className="detail-thumbs">
                            {imgs.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    className={`detail-thumb ${i === 0 ? 'active' : ''}`}
                                    alt={`${product.name} ${i + 1}`}
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
                    <h2>{product.name}</h2>

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
                                onBuyNow();
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
        </div>
    );
}