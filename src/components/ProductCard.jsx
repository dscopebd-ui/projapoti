import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice, getDiscountPercent } from '../utils/formatPrice.js';
import { slugify } from '../utils/slugify.js';

export default function ProductCard({ product }) {
    const { cart, addToCart } = useCart();
    const qty = cart[product.id] || 0;

    const imgSrc = product.img || product.images?.[0] || '';
    const discount = getDiscountPercent(product.price, product.oldPrice);
    const altText = `${product.name} — ${product.cat} — ৳${product.price} — প্রজাপতি`;

    const productUrl = `/product/${slugify(product.name)}-${product.id}`;

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

            <Link to={productUrl} title={`${product.name} — বিস্তারিত`}>
                <img
                    src={imgSrc}
                    alt={altText}
                    className="product-img"
                    loading="lazy"
                />
            </Link>

            <div className="product-info">
                <h3>
                    <Link
                        to={productUrl}
                        style={{ color: 'inherit' }}
                        title={`${product.name} — বিস্তারিত`}
                    >
                        {product.name}
                    </Link>
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

                    <Link
                        to={productUrl}
                        className="btn-details"
                        style={{ textAlign: 'center' }}
                        aria-label={`${product.name} এর বিস্তারিত`}
                    >
                        বিস্তারিত
                    </Link>
                </div>
            </div>
        </div>
    );
}