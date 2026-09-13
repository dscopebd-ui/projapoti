import { useState, useEffect } from 'react';
import { listenOrders, markOrderDelivered } from '../firebase/orders.js';
import { formatPrice } from '../utils/formatPrice.js';

const PAYMENT_LABELS = {
    cod: 'ক্যাশ অন ডেলিভারি',
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট',
    wallet: 'ওয়ালেট'
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        const unsub = listenOrders(
            (list) => {
                setOrders(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    const pendingList = orders.filter((o) => o.status === 'pending');
    const deliveredList = orders.filter((o) => o.status === 'delivered');

    const visibleList = filter === 'pending' ? pendingList : deliveredList;

    const handleDeliver = async (order) => {
        let msg =
            `অর্ডার ${order.orderId} ডেলিভারি মার্ক করবেন?\n\n` +
            `গ্রাহক: ${order.name}\n` +
            `সর্বমোট: ${formatPrice(order.total)}`;

        if (order.referrerUid) {
            msg += `\n\n💡 এই অর্ডারের জন্য রেফারার কমিশন পাবে।`;
        }

        if (!confirm(msg)) return;

        setProcessing(order.firebaseDocId);

        try {
            await markOrderDelivered(order.firebaseDocId, order);
            alert('✅ অর্ডার ডেলিভারি মার্ক হয়েছে।');
        } catch (err) {
            console.error(err);
            alert('সমস্যা: ' + err.message);
        } finally {
            setProcessing(null);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('bn-BD', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="admin-section">
            <h3>📦 অর্ডার ম্যানেজ</h3>

            <div className="admin-review-tabs">
                <button
                    type="button"
                    className={`admin-review-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    ⏳ নতুন ({pendingList.length})
                </button>
                <button
                    type="button"
                    className={`admin-review-tab ${filter === 'delivered' ? 'active' : ''}`}
                    onClick={() => setFilter('delivered')}
                >
                    ✅ ডেলিভারি হয়েছে ({deliveredList.length})
                </button>
            </div>

            <div className="admin-order-list">
                {loading ? (
                    <div className="admin-status">লোড হচ্ছে...</div>
                ) : visibleList.length === 0 ? (
                    <div className="admin-status">
                        {filter === 'pending'
                            ? 'কোনো নতুন অর্ডার নেই।'
                            : 'কোনো ডেলিভারি অর্ডার নেই।'}
                    </div>
                ) : (
                    visibleList.map((o) => (
                        <div key={o.firebaseDocId} className="admin-order-item">
                            {/* Header */}
                            <div className="admin-order-head">
                                <div>
                                    <div className="admin-order-id">
                                        #{o.orderId}
                                    </div>
                                    <div className="admin-order-date">
                                        {formatDate(o.createdAt)}
                                    </div>
                                </div>
                                <div className="admin-order-total">
                                    {formatPrice(o.total)}
                                </div>
                            </div>

                            {/* Customer */}
                            <div className="admin-order-customer">
                                <div>
                                    <span style={{ color: '#888' }}>👤 </span>
                                    <strong>{o.name}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>📞 </span>
                                    {o.phone}
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>📍 </span>
                                    {o.address}, {o.district}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="admin-order-items">
                                {o.items.map((item, idx) => (
                                    <div key={idx} className="admin-order-line">
                                        <span>
                                            {item.name} × {item.qty}
                                        </span>
                                        <span>
                                            {formatPrice(item.price * item.qty)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Summary */}
                            <div className="admin-order-summary">
                                <div className="admin-order-sum-row">
                                    <span>উপমোট</span>
                                    <span>{formatPrice(o.subtotal)}</span>
                                </div>
                                {o.couponDiscount > 0 && (
                                    <div className="admin-order-sum-row" style={{ color: '#16833b' }}>
                                        <span>🎟️ কুপন ({o.couponCode})</span>
                                        <span>-{formatPrice(o.couponDiscount)}</span>
                                    </div>
                                )}
                                {o.referralDiscount > 0 && (
                                    <div className="admin-order-sum-row" style={{ color: '#16833b' }}>
                                        <span>🎁 রেফারেল ({o.referrerCode})</span>
                                        <span>-{formatPrice(o.referralDiscount)}</span>
                                    </div>
                                )}
                                <div className="admin-order-sum-row">
                                    <span>🚚 ডেলিভারি</span>
                                    <span>{formatPrice(o.shipping)}</span>
                                </div>
                                <div className="admin-order-sum-row total">
                                    <span>সর্বমোট</span>
                                    <span>{formatPrice(o.total)}</span>
                                </div>
                            </div>

                            {/* Meta */}
                            <div className="admin-order-meta">
                                💳 {PAYMENT_LABELS[o.payment] || o.payment}
                                {o.trxId && ` • TrxID: ${o.trxId}`}
                                {o.referrerUid && (
                                    <>
                                        <br />
                                        🎁 রেফারার: {o.referrerCode}
                                        {o.commissionPaid && ' (কমিশন জমা হয়েছে ✅)'}
                                    </>
                                )}
                            </div>

                            {/* Actions */}
                            {o.status === 'pending' && (
                                <div className="admin-order-actions">
                                    <button
                                        type="button"
                                        className="admin-approve-btn"
                                        onClick={() => handleDeliver(o)}
                                        disabled={processing === o.firebaseDocId}
                                    >
                                        {processing === o.firebaseDocId
                                            ? '⏳ প্রসেস হচ্ছে...'
                                            : '✅ ডেলিভারি মার্ক করুন'}
                                    </button>
                                </div>
                            )}

                            {o.status === 'delivered' && (
                                <div className="admin-order-delivered">
                                    ✅ ডেলিভারি হয়েছে — {formatDate(o.deliveredAt)}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}