import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProducts } from '../context/ProductContext.jsx';
import { deleteProduct } from '../firebase/products.js';
import AdminLogin from './AdminLogin.jsx';
import AdminProductForm from './AdminProductForm.jsx';
import { formatPrice } from '../utils/formatPrice.js';

export default function AdminPanel({ open, onClose }) {
    const { user, isLoggedIn, logout } = useAuth();
    const { products } = useProducts();
    const [deleting, setDeleting] = useState(null);

    /* ---------- ESC key দিয়ে বন্ধ ---------- */
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

    if (!open) return null;

    return (
        <div
            className="admin-overlay open"
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
                                ? 'প্রোডাক্ট যোগ, ম্যানেজ ও ডিলিট করুন'
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

                        {/* ---------- MANAGE PRODUCTS ---------- */}
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
                                                    e.target.style.background =
                                                        '#f0e4f5';
                                                }}
                                            />
                                            <div className="admin-product-meta">
                                                <strong>{p.name}</strong>
                                                <small>
                                                    {p.cat} •{' '}
                                                    {formatPrice(p.price)}
                                                </small>
                                            </div>
                                            <button
                                                type="button"
                                                className="admin-delete-btn"
                                                disabled={deleting === p.firebaseDocId}
                                                onClick={() =>
                                                    handleDelete(
                                                        p.firebaseDocId,
                                                        p.name
                                                    )
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