import { useState } from 'react';
import { addReview } from '../firebase/reviews.js';
import StarRating from './StarRating.jsx';

export default function ReviewForm({ productId, productName, onSubmitted }) {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!customerName.trim()) {
            setError('আপনার নাম লিখুন');
            return;
        }
        if (customerName.trim().length < 2) {
            setError('নাম কমপক্ষে ২ অক্ষরের হতে হবে');
            return;
        }
        if (!comment.trim()) {
            setError('রিভিউ লিখুন');
            return;
        }
        if (comment.trim().length < 3) {
            setError('রিভিউ কমপক্ষে ৩ অক্ষরের হতে হবে');
            return;
        }

        setSubmitting(true);

        try {
            await addReview({
                productId,
                productName,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                rating,
                comment: comment.trim()
            });

            setSuccess(true);
            setCustomerName('');
            setCustomerPhone('');
            setRating(5);
            setComment('');

            if (onSubmitted) onSubmitted();
        } catch (err) {
            console.error(err);
            setError('রিভিউ পাঠানো যায়নি। আবার চেষ্টা করুন।');
        } finally {
            setSubmitting(false);
        }
    };

    /* সফল হলে ধন্যবাদ মেসেজ */
    if (success) {
        return (
            <div className="review-success-box">
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>✅</div>
                <h4 style={{ color: '#16833b', marginBottom: 6 }}>
                    ধন্যবাদ!
                </h4>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    আপনার রিভিউ গ্রহণ করা হয়েছে। অ্যাডমিন approve করলে সাইটে দেখা যাবে।
                </p>
                <button
                    type="button"
                    className="review-cancel-btn"
                    onClick={() => setSuccess(false)}
                >
                    আরেকটি রিভিউ লিখুন
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="review-form">
            <h4 className="review-form-title">✍️ আপনার রিভিউ দিন</h4>

            {error && (
                <div className="review-error">{error}</div>
            )}

            <div className="review-field">
                <label>আপনার নাম <span className="req">*</span></label>
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="যেমন: রাহিম আহমেদ"
                    maxLength={100}
                    required
                />
            </div>

            <div className="review-field">
                <label>ফোন (অপশনাল)</label>
                <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    maxLength={20}
                />
            </div>

            <div className="review-field">
                <label>রেটিং <span className="req">*</span></label>
                <div style={{ padding: '6px 0' }}>
                    <StarRating
                        value={rating}
                        onChange={setRating}
                        size="1.8rem"
                    />
                </div>
            </div>

            <div className="review-field">
                <label>রিভিউ <span className="req">*</span></label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="প্রোডাক্ট সম্পর্কে আপনার মতামত লিখুন..."
                    maxLength={1000}
                    rows={4}
                    required
                />
                <div className="review-char-count">
                    {comment.length} / ১০০০
                </div>
            </div>

            <button
                type="submit"
                className="review-submit-btn"
                disabled={submitting}
            >
                {submitting ? '⏳ পাঠানো হচ্ছে...' : '📝 রিভিউ পাঠান'}
            </button>
        </form>
    );
}