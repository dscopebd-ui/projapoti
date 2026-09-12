import { useCart } from '../context/CartContext.jsx';
import { formatPrice, getDiscountPercent } from '../utils/formatPrice.js';

export default function ProductCard({ product, onOpenDetail }) {
    const { cart, addToCart } = useCart();
    const qty = cart[product.id] || 0;

    const imgSrc = product.img || product.images?.[0] || '';
    const discount = getDiscountPercent(product.price, product.oldPrice);

    /* SEO-friendly alt text */
    const altText = `${product.name} — ${product.cat} — ৳${product.price} — প্রজাপতি`;

    return (
        <div className="product-card">
            {qty > 0 && (
                <div className="cart-badge" title={`কার্টে ${qty}টি`}>
                    🛒 {qty}
                </div>
            )}

            {discount > 0 && (
                <div className="discount-ribbon">
                    {discount}% ছাড়
                </div>
            )}

            <img
                src={imgSrc}
                alt={altText}
                title={product.name}
                className="product-img"
                onClick={() => onOpenDetail(product.id)}
                loading="lazy"
            />

            <div className="product-info">
                <h3
                    onClick={() => onOpenDetail(product.id)}
                    title={`${product.name} — বিস্তারিত দেখুন`}
                >
                    {product.name}
                </h3>

                <div className="price-row">
                    <div className="price-stack">
                        {product.oldPrice > product.price && (
                            <span className="old-price">
                                ৳ {product.oldPrice}
                            </span>
                        )}
                        <span className="price">
                            {formatPrice(product.price)}
                        </span>
                    </div>
                </div>

                <div className="btn-row">
                    <button
                        className={`btn-add ${qty > 0 ? 'added' : ''}`}
                        type="button"
                        onClick={() => addToCart(product.id, 1)}
                        aria-label={`${product.name} কার্টে যোগ করুন`}
                    >
                        {qty > 0 ? `কার্টে (${qty})` : 'কার্টে যোগ'}
                    </button>

                    <button
                        className="btn-details"
                        type="button"
                        onClick={() => onOpenDetail(product.id)}
                        aria-label={`${product.name} এর বিস্তারিত দেখুন`}
                    >
                        বিস্তারিত
                    </button>
                </div>
            </div>
        </div>
    );
}