import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    listenApprovedReviews,
    calcOverallRating
} from '../firebase/reviews.js';
import { slugify } from '../utils/slugify.js';
import StarRating from './StarRating.jsx';

export default function HomeReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = listenApprovedReviews(
            (list) => {
                setReviews(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    /* ১টার কম রিভিউ থাকলে সেকশন দেখাবো না */
    if (loading || reviews.length < 1) {
        return null;
    }

    const { average, count } = calcOverallRating(reviews);

    /* সর্বোচ্চ ৬টি রিভিউ দেখাই */
    const visible = reviews.slice(0, 6);

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('bn-BD', {
            year: 'numeric',
            month: 'short'
        }).format(date);
    };

    return (
        <div className="home-reviews">
            <h2 className="section-title">
                ⭐ কাস্টমাররা যা বলছেন
            </h2>

            {/* Overall Rating Badge */}
            <div className="home-reviews-summary">
                <div className="home-reviews-average">
                    {average.toFixed(1)}
                </div>
                <StarRating value={average} readOnly size="1.4rem" />
                <div className="home-reviews-count">
                    {count}টি কাস্টমার রেটিং
                </div>
            </div>

            {/* Review Cards */}
            <div className="home-reviews-grid">
                {visible.map((r) => {
                    const productUrl = r.productId
                        ? `/product/${slugify(r.productName)}-${r.productId}`
                        : '#';

                    return (
                        <div key={r.id} className="home-review-card">
                            <div className="home-review-head">
                                <div className="home-review-avatar">
                                    {r.customerName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                                <div className="home-review-meta">
                                    <div className="home-review-name">
                                        {r.customerName}
                                    </div>
                                    <StarRating
                                        value={r.rating}
                                        readOnly
                                        size="0.85rem"
                                    />
                                </div>
                                {r.createdAt && (
                                    <div className="home-review-date">
                                        {formatDate(r.createdAt)}
                                    </div>
                                )}
                            </div>

                            <p className="home-review-comment">
                                "{r.comment}"
                            </p>

                            {r.productName && (
                                <div className="home-review-product">
                                    <span
                                        style={{
                                            color: '#888',
                                            fontSize: '0.75rem'
                                        }}
                                    >
                                        📦 {r.productName}
                                    </span>
                                    {r.productId && (
                                        <Link
                                            to={productUrl}
                                            className="home-review-link"
                                        >
                                            দেখুন →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}