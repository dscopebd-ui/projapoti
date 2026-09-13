import { useState } from 'react';
import { validateCoupon } from '../firebase/coupons.js';
import { formatPrice } from '../utils/formatPrice.js';

export default function CouponInput({ subtotal, appliedCoupon, onApply, onRemove }) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async (e) => {
        e.preventDefault();
        setError('');

        if (!code.trim()) {
            setError('কুপন কোড লিখুন');
            return;
        }

        setLoading(true);

        try {
            const result = await validateCoupon(code, subtotal);

            if (!result.valid) {
                setError(result.error);
                return;
            }

            onApply(result.coupon, result.discount);
            setCode('');
        } catch (err) {
            console.error(err);
            setError('কুপন যাচাই করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    if (appliedCoupon) {
        return (
            <div className="coupon-applied-box">
                <div className="coupon-applied-info">
                    <span className="coupon-applied-icon">🎟️</span>
                    <div>
                        <div className="coupon-applied-code">
                            {appliedCoupon.code}
                        </div>
                        <div className="coupon-applied-value">
                            {appliedCoupon.discountType === 'percent'
                                ? `${appliedCoupon.discountValue}% ছাড়`
                                : `${formatPrice(appliedCoupon.discountValue)} ছাড়`}
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    className="coupon-remove-btn"
                    onClick={onRemove}
                >
                    বাদ দিন
                </button>
            </div>
        );
    }

    return (
        <div className="coupon-input-section">
            <label className="coupon-label">🎟️ কুপন কোড (ঐচ্ছিক)</label>
            <form className="coupon-form" onSubmit={handleApply}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="যেমন: SAVE10"
                    className="coupon-input"
                    disabled={loading}
                    maxLength={30}
                />
                <button
                    type="submit"
                    className="coupon-apply-btn"
                    disabled={loading || !code.trim()}
                >
                    {loading ? '⏳' : 'প্রয়োগ করুন'}
                </button>
            </form>
            {error && <div className="coupon-error">{error}</div>}
        </div>
    );
}