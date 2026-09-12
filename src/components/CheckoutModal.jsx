import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { paymentMethods, getDeliveryCharge } from '../data/paymentMethods.js';
import { districts } from '../data/districts.js';
import { SITE, WEB3FORMS_KEY } from '../data/siteConfig.js';
import { formatPrice } from '../utils/formatPrice.js';

export default function CheckoutModal({ open, onClose }) {
    const { cart, clearCart } = useCart();
    const { products } = useProducts();

    /* ---------- Form state ---------- */
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [district, setDistrict] = useState('');
    const [payment, setPayment] = useState('cod');
    const [trxId, setTrxId] = useState('');

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successOrderId, setSuccessOrderId] = useState(null);

    /* ---------- Cart items ---------- */
    const entries = Object.entries(cart).filter(([, qty]) => qty > 0);
    const items = entries
        .map(([id, qty]) => {
            const p = products.find((pr) => String(pr.id) === String(id));
            return p ? { product: p, qty } : null;
        })
        .filter(Boolean);

    const subtotal = items.reduce(
        (sum, { product, qty }) => sum + product.price * qty,
        0
    );
    const shipping = getDeliveryCharge(district);
    const total = subtotal + shipping;

    /* ---------- Reset ---------- */
    const resetForm = () => {
        setName('');
        setPhone('');
        setAddress('');
        setDistrict('');
        setPayment('cod');
        setTrxId('');
        setErrors({});
        setSubmitError('');
    };

    const handleClose = () => {
        if (submitting) return;
        if (successOrderId) {
            resetForm();
            setSuccessOrderId(null);
            clearCart();
        }
        onClose();
    };

    /* ---------- Validate ---------- */
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = 'নাম লিখুন';
        if (!phone.trim()) e.phone = 'ফোন নম্বর লিখুন';
        if (!address.trim()) e.address = 'ঠিকানা লিখুন';
        if (!district) e.district = 'জেলা নির্বাচন করুন';
        if (payment !== 'cod' && !trxId.trim()) {
            e.trxId = 'ট্রানজেকশন আইডি লিখুন';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    /* ---------- Submit ---------- */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;
        if (items.length === 0) return;

        setSubmitting(true);
        setSubmitError('');

        /* অর্ডার আইডি */
        const orderId =
            'PRJ-' + Math.floor(10000 + Math.random() * 89999);

        /* প্রোডাক্ট লিস্ট */
        const itemsList = items
            .map(
                ({ product, qty }) =>
                    `${product.name} — ${qty}টি x ${formatPrice(
                        product.price
                    )} = ${formatPrice(product.price * qty)}`
            )
            .join('\n');

        const paymentLabel =
            paymentMethods.find((pm) => pm.id === payment)?.label || '';

        const payload = {
            access_key: WEB3FORMS_KEY,
            subject: `নতুন অর্ডার — ${orderId} (${SITE.name})`,
            from_name: SITE.name,
            'অর্ডার নম্বর': orderId,
            'গ্রাহকের নাম': name,
            'ফোন': phone,
            'ঠিকানা': `${address}, ${district}`,
            'জেলা': district,
            'পণ্যসমূহ': itemsList,
            'উপমোট': formatPrice(subtotal),
            'ডেলিভারি চার্জ': formatPrice(shipping),
            'সর্বমোট': formatPrice(total),
            'পেমেন্ট মাধ্যম': paymentLabel,
            'ট্রানজেকশন আইডি': trxId || 'প্রযোজ্য নয় (COD)'
        };

        try {
            const res = await fetch(
                'https://api.web3forms.com/submit',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );
            const result = await res.json();

            if (!result.success) {
                throw new Error(
                    result.message || 'পাঠানো যায়নি'
                );
            }

            setSuccessOrderId(orderId);
        } catch (err) {
            console.error(err);
            setSubmitError(
                'অর্ডার পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    const pm = paymentMethods.find((p) => p.id === payment);

    return (
        <div className="modal-overlay open" onClick={handleClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ---------- SUCCESS ---------- */}
                {successOrderId ? (
                    <div className="confirm">
                        <div className="check">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M4 12.5L9.5 18L20 6"
                                    stroke="#fff"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        <h3>অর্ডার সফল হয়েছে</h3>

                        <p>
                            ধন্যবাদ! আপনার অর্ডারটি গৃহীত হয়েছে।
                            শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
                        </p>

                        <div className="order-id">
                            অর্ডার নম্বর: {successOrderId}
                        </div>

                        <button
                            className="place-order-btn"
                            style={{ marginTop: 22 }}
                            type="button"
                            onClick={handleClose}
                        >
                            দোকানে ফিরে যান
                        </button>
                    </div>
                ) : (
                    /* ---------- FORM ---------- */
                    <form onSubmit={handleSubmit}>
                        <h3>ডেলিভারি তথ্য</h3>
                        <div className="sub">
                            আপনার সঠিক তথ্য দিয়ে অর্ডারটি নিশ্চিত করুন।
                        </div>

                        {/* NAME */}
                        <div className="field">
                            <label>পুরো নাম</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="আপনার নাম লিখুন"
                                className={errors.name ? 'err' : ''}
                            />
                            {errors.name && (
                                <div className="field-error">
                                    {errors.name}
                                </div>
                            )}
                        </div>

                        {/* PHONE */}
                        <div className="field">
                            <label>ফোন নম্বর</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="যেমন 01XXXXXXXXX"
                                className={errors.phone ? 'err' : ''}
                            />
                            {errors.phone && (
                                <div className="field-error">
                                    {errors.phone}
                                </div>
                            )}
                        </div>

                        {/* ADDRESS */}
                        <div className="field">
                            <label>বিস্তারিত ঠিকানা</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="বাসা/রোড/গ্রাম/এলাকার নাম"
                                className={errors.address ? 'err' : ''}
                            />
                            {errors.address && (
                                <div className="field-error">
                                    {errors.address}
                                </div>
                            )}
                        </div>

                        {/* DISTRICT */}
                        <div className="field">
                            <label>জেলা</label>
                            <select
                                value={district}
                                onChange={(e) => setDistrict(e.target.value)}
                                className={errors.district ? 'err' : ''}
                            >
                                <option value="">জেলা নির্বাচন করুন</option>
                                {districts.map((d) => (
                                    <option key={d} value={d}>
                                        {d}
                                    </option>
                                ))}
                            </select>
                            {errors.district && (
                                <div className="field-error">
                                    {errors.district}
                                </div>
                            )}
                        </div>

                        {/* DELIVERY INFO */}
                        <div className="delivery-info">
                            {!district ? (
                                <>📦 জেলা নির্বাচন করলে ডেলিভারি চার্জ দেখাবে।</>
                            ) : (
                                <>
                                    🚚 <b>{district}</b> — ডেলিভারি চার্জ{' '}
                                    <b>{formatPrice(shipping)}</b>
                                </>
                            )}
                        </div>

                        {/* PAYMENT */}
                        <div className="field">
                            <label>পেমেন্ট মাধ্যম বেছে নিন</label>
                            <div className="payment-methods">
                                {paymentMethods.map((opt) => (
                                    <label
                                        key={opt.id}
                                        className={`payment-option ${
                                            payment === opt.id ? 'selected' : ''
                                        }`}
                                        data-method={opt.id}
                                        onClick={() => setPayment(opt.id)}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={opt.id}
                                            checked={payment === opt.id}
                                            onChange={() => setPayment(opt.id)}
                                        />
                                        <div className="pm-logo">
                                            {opt.id === 'cod' ? '৳ ক্যাশ' : opt.label}
                                        </div>
                                        <div className="pm-label">
                                            {opt.id === 'cod'
                                                ? 'ক্যাশ অন ডেলিভারি'
                                                : opt.label}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {payment !== 'cod' && pm && (
                                <div className="payment-number-box show">
                                    <b>{pm.label}</b> নাম্বারে (Send Money) টাকা
                                    পাঠান: <b>{pm.number}</b>। পাঠানোর পর
                                    ট্রানজেকশন আইডি নিচে লিখুন।
                                </div>
                            )}

                            {payment !== 'cod' && (
                                <div className="field" style={{ marginTop: 12 }}>
                                    <label>ট্রানজেকশন আইডি (TrxID)</label>
                                    <input
                                        type="text"
                                        value={trxId}
                                        onChange={(e) => setTrxId(e.target.value)}
                                        placeholder="যেমন 8N7A9XXXXX"
                                        className={errors.trxId ? 'err' : ''}
                                    />
                                    {errors.trxId && (
                                        <div className="field-error">
                                            {errors.trxId}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* SUMMARY */}
                        <div className="modal-summary">
                            <div className="row">
                                <span>উপমোট</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="row">
                                <span>ডেলিভারি চার্জ</span>
                                <span>{formatPrice(shipping)}</span>
                            </div>
                            <div className="row total">
                                <span>সর্বমোট</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={submitting}
                        >
                            {submitting
                                ? 'পাঠানো হচ্ছে...'
                                : 'অর্ডার নিশ্চিত করুন'}
                        </button>

                        {submitError && (
                            <div
                                className="field-error"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: 10
                                }}
                            >
                                {submitError}
                            </div>
                        )}

                        <span
                            className="modal-cancel"
                            onClick={handleClose}
                        >
                            বাতিল করুন, কার্টে ফিরে যান
                        </span>
                    </form>
                )}
            </div>
        </div>
    );
}