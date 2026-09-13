import { useState, useEffect } from 'react';
import {
    listenCoupons,
    addCoupon,
    deleteCoupon,
    setCouponActive
} from '../firebase/coupons.js';
import { formatPrice } from '../utils/formatPrice.js';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percent');
    const [discountValue, setDiscountValue] = useState('');
    const [minOrder, setMinOrder] = useState('');
    const [maxUses, setMaxUses] = useState('');
    const [expiresAt, setExpiresAt] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const unsub = listenCoupons(
            (list) => {
                setCoupons(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    const resetForm = () => {
        setCode('');
        setDiscountType('percent');
        setDiscountValue('');
        setMinOrder('');
        setMaxUses('');
        setExpiresAt('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!code.trim()) {
            setError('কুপন কোড লিখুন');
            return;
        }
        if (code.trim().length < 3) {
            setError('কোড কমপক্ষে ৩ অক্ষরের হতে হবে');
            return;
        }
        if (!discountValue || Number(discountValue) <= 0) {
            setError('ছাড়ের পরিমাণ লিখুন');
            return;
        }
        if (discountType === 'percent' && Number(discountValue) > 100) {
            setError('শতাংশ ১০০-র বেশি হতে পারে না');
            return;
        }

        const exists = coupons.some(
            (c) => c.code === code.trim().toUpperCase()
        );
        if (exists) {
            setError('এই কোডটি আগে থেকেই আছে');
            return;
        }

        setSaving(true);

        try {
            await addCoupon({
                code: code.trim().toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minOrder: Number(minOrder) || 0,
                maxUses: Number(maxUses) || 0,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            });

            setSuccess('✅ কুপন তৈরি হয়েছে!');
            resetForm();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError('❌ কুপন তৈরি করতে সমস্যা হয়েছে');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, couponCode) => {
        if (!confirm(`"${couponCode}" কুপনটি ডিলিট করতে চান?`)) return;
        try {
            await deleteCoupon(id);
        } catch (err) {
            console.error(err);
            alert('ডিলিট ব্যর্থ: ' + err.message);
        }
    };

    const handleToggleActive = async (id, active) => {
        try {
            await setCouponActive(id, !active);
        } catch (err) {
            console.error(err);
            alert('পরিবর্তন ব্যর্থ: ' + err.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return '--';
        return new Intl.DateTimeFormat('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="admin-section">
            <h3>🎟️ কুপন ম্যানেজ</h3>

            <form onSubmit={handleSubmit} className="admin-coupon-form">
                {error && <div className="admin-error-msg show">{error}</div>}
                {success && <div className="admin-success-msg show">{success}</div>}

                <div className="admin-row">
                    <div className="admin-field">
                        <label>
                            কুপন কোড <span className="req">*</span>
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="যেমন: SAVE10"
                            maxLength={30}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <label>
                            টাইপ <span className="req">*</span>
                        </label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value)}
                        >
                            <option value="percent">শতাংশ (%)</option>
                            <option value="fixed">নির্দিষ্ট টাকা (৳)</option>
                        </select>
                    </div>
                </div>

                <div className="admin-row">
                    <div className="admin-field">
                        <label>
                            ছাড়ের পরিমাণ <span className="req">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === 'percent' ? '10' : '100'}
                            required
                        />
                    </div>

                    <div className="admin-field">
                        <label>সর্বনিম্ন অর্ডার (৳)</label>
                        <input
                            type="number"
                            min="0"
                            value={minOrder}
                            onChange={(e) => setMinOrder(e.target.value)}
                            placeholder="500"
                        />
                    </div>
                </div>

                <div className="admin-row">
                    <div className="admin-field">
                        <label>সর্বোচ্চ ব্যবহার</label>
                        <input
                            type="number"
                            min="0"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            placeholder="100"
                        />
                    </div>

                    <div className="admin-field">
                        <label>মেয়াদ শেষের তারিখ</label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="admin-submit"
                    disabled={saving}
                >
                    {saving ? '⏳ সেভ হচ্ছে...' : '➕ কুপন তৈরি করুন'}
                </button>
            </form>

            <div style={{ marginTop: 20 }}>
                <h4
                    style={{
                        fontSize: '0.85rem',
                        color: '#30384f',
                        marginBottom: 10,
                        fontWeight: 700
                    }}
                >
                    সব কুপন ({coupons.length})
                </h4>

                <div className="admin-coupon-list">
                    {loading ? (
                        <div className="admin-status">লোড হচ্ছে...</div>
                    ) : coupons.length === 0 ? (
                        <div className="admin-status">
                            এখনো কোনো কুপন তৈরি করা হয়নি।
                        </div>
                    ) : (
                        coupons.map((c) => (
                            <div
                                key={c.id}
                                className={`admin-coupon-item ${!c.active ? 'inactive' : ''}`}
                            >
                                <div className="admin-coupon-head">
                                    <div>
                                        <div className="admin-coupon-code">
                                            🎟️ {c.code}
                                        </div>
                                        <div className="admin-coupon-discount">
                                            {c.discountType === 'percent'
                                                ? `${c.discountValue}% ছাড়`
                                                : `${formatPrice(c.discountValue)} ছাড়`}
                                            {c.minOrder > 0 && (
                                                <> • সর্বনিম্ন {formatPrice(c.minOrder)}</>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="admin-coupon-toggle"
                                        onClick={() => handleToggleActive(c.id, c.active)}
                                        title={c.active ? 'বন্ধ করুন' : 'চালু করুন'}
                                    >
                                        {c.active ? '✅' : '⏸️'}
                                    </button>
                                </div>

                                <div className="admin-coupon-meta">
                                    <span>
                                        ব্যবহার: {c.usedCount}
                                        {c.maxUses > 0 && ` / ${c.maxUses}`}
                                    </span>
                                    {c.expiresAt && (
                                        <span>মেয়াদ: {formatDate(c.expiresAt)}</span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    className="admin-coupon-delete"
                                    onClick={() => handleDelete(c.id, c.code)}
                                >
                                    🗑️ ডিলিট
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}