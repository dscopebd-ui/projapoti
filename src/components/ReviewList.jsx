import { useEffect, useState } from 'react';
import { listenProductReviews, calcAverageRating } from '../firebase/reviews.js';
import StarRating from './StarRating.jsx';

export default function ReviewList({ productId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!productId) return;

        setLoading(true);
        const unsub = listenProductReviews(
            productId,
            (list) => {
                setReviews(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, [productId]);

    if (loading) {
        return (
            <div className="review-list-loading">
                রিভিউ লোড হচ্ছে...
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="review-empty">
                এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি আপনিই দিন!
            </div>
        );
    }

    const { average, count } = calcAverageRating(reviews);

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <div className="review-list">
            <div className="review-summary">
                <div className="review-summary-score">
                    <div className="review-average">
                        {average.toFixed(1)}
                    </div>
                    <StarRating value={average} readOnly size="1.3rem" />
                    <div className="review-count">
                        {count}টি রিভিউ
                    </div>
                </div>
            </div>

            <div className="review-items">
                {reviews.map((r) => (
                    <div key={r.id} className="review-item">
                        <div className="review-item-head">
                            <div className="review-item-avatar">
                                {r.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="review-item-meta">
                                <div className="review-item-name">
                                    {r.customerName}
                                </div>
                                <StarRating
                                    value={r.rating}
                                    readOnly
                                    size="0.9rem"
                                />
                            </div>
                            {r.createdAt && (
                                <div className="review-item-date">
                                    {formatDate(r.createdAt)}
                                </div>
                            )}
                        </div>
                        <p className="review-item-comment">{r.comment}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}