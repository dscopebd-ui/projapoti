import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { formatPrice } from '../utils/formatPrice.js';

export default function CartDrawer({ open, onClose }) {
    const navigate = useNavigate();
    const { cart, incQty, decQty, removeItem } = useCart();
    const { products } = useProducts();

    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);

    const items = entries
        .map(([id, qty]) => {
            const p = products.find(
                (pr) => String(pr.id) === String(id)
            );
            return p ? { product: p, qty } : null;
        })
        .filter(Boolean);

    const subtotal = items.reduce(
        (sum, { product, qty }) => sum + product.price * qty,
        0
    );

    const empty = items.length === 0;

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <>
            <div
                className={`overlay ${open ? 'open' : ''}`}
                onClick={onClose}
            />

            <div className={`drawer ${open ? 'open' : ''}`}>
                <div className="drawer-head">
                    <h3>আপনার কার্ট</h3>
                    <button
                        className="drawer-close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        &times;
                    </button>
                </div>

                <div className="drawer-items">
                    {empty ? (
                        <div className="empty-cart">
                            আপনার কার্ট খালি।<br />
                            পণ্য যোগ করে দেখুন।
                        </div>
                    ) : (
                        items.map(({ product, qty }) => (
                            <div
                                key={product.firebaseDocId || product.id}
                                className="drawer-item"
                            >
                                <img
                                    src={product.img}
                                    alt={product.name}
                                />
                                <div className="info">
                                    <div className="name">
                                        {product.name}
                                    </div>
                                    <div className="price">
                                        {formatPrice(product.price)}
                                    </div>

                                    <div className="qty-row">
                                        <button
                                            className="qty-btn"
                                            type="button"
                                            onClick={() => decQty(product.id)}
                                        >
                                            −
                                        </button>
                                        <span className="qty-val">
                                            {qty}
                                        </span>
                                        <button
                                            className="qty-btn"
                                            type="button"
                                            onClick={() => incQty(product.id)}
                                        >
                                            +
                                        </button>
                                        <span
                                            className="remove-link"
                                            onClick={() => removeItem(product.id)}
                                        >
                                            সরান
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="drawer-foot">
                    <div className="subtotal-row">
                        <span>উপমোট</span>
                        <span className="val">
                            {formatPrice(subtotal)}
                        </span>
                    </div>

                    <button
                        className="checkout-btn"
                        type="button"
                        disabled={empty}
                        onClick={handleCheckout}
                    >
                        চেকআউট করুন
                    </button>
                </div>
            </div>
        </>
    );
}