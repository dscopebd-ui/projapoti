import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { deleteProduct } from '../firebase/products.js';
import {
    listenAllReviews,
    setReviewApproved,
    deleteReview
} from '../firebase/reviews.js';
import AdminLogin from './AdminLogin.jsx';
import AdminProductForm from './AdminProductForm.jsx';
import AdminCoupons from './AdminCoupons.jsx';
import StarRating from './StarRating.jsx';
import { formatPrice } from '../utils/formatPrice.js';

export default function AdminPanel({ open, onClose }) {
    const { user, isLoggedIn, logout } = useAuth();
    const { products } = useProducts();
    const [deleting, setDeleting] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewFilter, setReviewFilter] = useState('pending');
    const [reviewLoading, setReviewLoading] = useState(true);

    useEffect(() => {
        if (!open || !isLoggedIn) return;

        setReviewLoading(true);
        const unsub = listenAllReviews(
            (list) => {
                setReviews(list);
                setReviewLoading(false);
            },
            () => setReviewLoading(false)
        );
        return () => unsub();
    }, [open, isLoggedIn]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    const handleDelete = async (docId, name) => {
        if (!confirm(`“${name}” ডিলিট করতে চান?`)) return;

        setDeleting(docId);
        try {
            await deleteProduct(docId);
        } catch (err) {
            console.error(err);
            alert('ডিলিট ব্যর্থ: ' + err.message);
        } finally {
            setDeleting(null);
        }
    };

    const handleApprove = async (reviewId, approved) => {
        try {
            await setReviewApproved(reviewId, approved);
        } catch (err) {
            console.error(err);
            alert('Approve ব্যর্থ: ' + err.message);
        }
    };

    const handleDeleteReview = async (reviewId, customerName) => {
        if (!confirm(`“${customerName}” এর রিভিউটি ডিলিট করতে চান?`)) return;
        try {
            await deleteReview(reviewId);
        } catch (err) {
            console.error(err);
            alert('ডিলিট ব্যর্থ: ' + err.message);
        }
    };

    const pendingReviews = reviews.filter((r) => !r.approved);
    const approvedReviews = reviews.filter((r) => r.approved);

    const visibleReviews =
        reviewFilter === 'pending' ? pendingReviews : approvedReviews;

    if (!open) return null;

    return (
        <div
            className={`admin-overlay ${open ? 'open' : ''}`}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="admin-modal">
                <div className="admin-head">
                    <div>
                        <h2>{isLoggedIn ? '⚙️ Admin Panel' : '🔐 Admin Login'}</h2>
                        <div className="admin-sub">
                            {isLoggedIn
                                ? 'প্রোডাক্ট, রিভিউ, কুপন ও অর্ডার ম্যানেজ করুন'
                                : 'শুধু অ্যাডমিন প্রবেশ করতে পারবেন'}
                        </div>
                    </div>
                    <button
                        className="admin-close"
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {!isLoggedIn ? (
                    <AdminLogin onSuccess={onClose} />
                ) : (
                    <>
                        <div className="admin-status">
                            ✅ সফলভাবে লগইন করেছেন
                        </div>
                        <div className="admin-user-info">
                            👤 {user?.email}
                        </div>

                        <AdminProductForm />

                        {/* REVIEWS MANAGEMENT */}
                        <div className="admin-section">
                            <h3>⭐ রিভিউ ম্যানেজ</h3>

                            <div className="admin-review-tabs">
                                <button
                                    type="button"
                                    className={`admin-review-tab ${reviewFilter === 'pending' ? 'active' : ''}`}
                                    onClick={() => setReviewFilter('pending')}
                                >
                                    ⏳ অপেক্ষমাণ ({pendingReviews.length})
                                </button>
                                <button
                                    type="button"
                                    className={`admin-review-tab ${reviewFilter === 'approved' ? 'active' : ''}`}
                                    onClick={() => setReviewFilter('approved')}
                                >
                                    ✅ অনুমোদিত ({approvedReviews.length})
                                </button>
                            </div>

                            <div className="admin-review-list">
                                {reviewLoading ? (
                                    <div className="admin-status">
                                        রিভিউ লোড হচ্ছে...
                                    </div>
                                ) : visibleReviews.length === 0 ? (
                                    <div className="admin-status">
                                        {reviewFilter === 'pending'
                                            ? 'কোনো অপেক্ষমাণ রিভিউ নেই।'
                                            : 'কোনো অনুমোদিত রিভিউ নেই।'}
                                    </div>
                                ) : (
                                    visibleReviews.map((r) => (
                                        <div key={r.id} className="admin-review-item">
                                            <div className="admin-review-head">
                                                <div>
                                                    <strong>{r.customerName}</strong>
                                                    <div
                                                        style={{
                                                            fontSize: '0.72rem',
                                                            color: '#888',
                                                            marginTop: '2px'
                                                        }}
                                                    >
                                                        {r.productName}
                                                    </div>
                                                </div>
                                                <StarRating
                                                    value={r.rating}
                                                    readOnly
                                                    size="0.85rem"
                                                />
                                            </div>

                                            <p className="admin-review-comment">
                                                {r.comment}
                                            </p>

                                            {r.customerPhone && (
                                                <div
                                                    style={{
                                                        fontSize: '0.7rem',
                                                        color: '#888',
                                                        marginTop: '4px'
                                                    }}
                                                >
                                                    📞 {r.customerPhone}
                                                </div>
                                            )}

                                            <div className="admin-review-actions">
                                                {!r.approved ? (
                                                    <button
                                                        type="button"
                                                        className="admin-approve-btn"
                                                        onClick={() => handleApprove(r.id, true)}
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className="admin-unapprove-btn"
                                                        onClick={() => handleApprove(r.id, false)}
                                                    >
                                                        ↩️ Unapprove
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="admin-delete-btn"
                                                    onClick={() =>
                                                        handleDeleteReview(r.id, r.customerName)
                                                    }
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* 🆕 COUPONS MANAGEMENT */}
                        <AdminCoupons />

                        {/* PRODUCTS */}
                        <div className="admin-section">
                            <h3>🗑️ প্রোডাক্ট ম্যানেজ</h3>
                            <div className="admin-product-list">
                                {products.length === 0 ? (
                                    <div className="admin-status">
                                        এখনো কোনো প্রোডাক্ট যোগ করা হয়নি।
                                    </div>
                                ) : (
                                    products.map((p) => (
                                        <div
                                            key={p.firebaseDocId || p.id}
                                            className="admin-product-item"
                                        >
                                            <img
                                                src={p.img}
                                                alt={p.name}
                                                onError={(e) => {
                                                    e.target.style.background = '#f0e4f5';
                                                }}
                                            />
                                            <div className="admin-product-meta">
                                                <strong>{p.name}</strong>
                                                <small>
                                                    {p.cat} • {formatPrice(p.price)}
                                                </small>
                                            </div>
                                            <button
                                                type="button"
                                                className="admin-delete-btn"
                                                disabled={deleting === p.firebaseDocId}
                                                onClick={() =>
                                                    handleDelete(p.firebaseDocId, p.name)
                                                }
                                            >
                                                {deleting === p.firebaseDocId
                                                    ? 'ডিলিট হচ্ছে...'
                                                    : '🗑️ ডিলিট'}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="admin-section">
                            <button
                                type="button"
                                className="admin-secondary"
                                onClick={async () => {
                                    await logout();
                                    onClose();
                                }}
                            >
                                লগআউট
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}