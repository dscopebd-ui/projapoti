import { useState, useEffect } from 'react';
import { listenAllAffiliates } from '../firebase/affiliates.js';
import { formatPrice } from '../utils/formatPrice.js';

export default function AdminAffiliates() {
    const [affiliates, setAffiliates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const unsub = listenAllAffiliates(
            (list) => {
                setAffiliates(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    const filtered = affiliates.filter((a) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            (a.name || '').toLowerCase().includes(q) ||
            (a.email || '').toLowerCase().includes(q) ||
            (a.phone || '').toLowerCase().includes(q) ||
            (a.referralCode || '').toLowerCase().includes(q)
        );
    });

    /* Stats */
    const totalCommission = affiliates.reduce(
        (s, a) => s + (a.totalEarnings || 0),
        0
    );
    const totalWallet = affiliates.reduce(
        (s, a) => s + (a.walletBalance || 0),
        0
    );
    const totalReferrals = affiliates.reduce(
        (s, a) => s + (a.totalReferrals || 0),
        0
    );

    /* Top 5 referrers */
    const topReferrers = [...affiliates]
        .sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0))
        .slice(0, 5);

    return (
        <div className="admin-section">
            <h3>👥 এফিলিয়েট ম্যানেজ</h3>

            {/* Stats */}
            <div className="admin-affiliate-stats">
                <div className="admin-aff-stat-card">
                    <div className="admin-aff-stat-value">
                        {affiliates.length}
                    </div>
                    <div className="admin-aff-stat-label">মোট এফিলিয়েট</div>
                </div>
                <div className="admin-aff-stat-card">
                    <div className="admin-aff-stat-value">
                        {totalReferrals}
                    </div>
                    <div className="admin-aff-stat-label">মোট রেফারেল</div>
                </div>
                <div className="admin-aff-stat-card">
                    <div className="admin-aff-stat-value">
                        {formatPrice(totalCommission)}
                    </div>
                    <div className="admin-aff-stat-label">মোট কমিশন</div>
                </div>
                <div className="admin-aff-stat-card">
                    <div className="admin-aff-stat-value">
                        {formatPrice(totalWallet)}
                    </div>
                    <div className="admin-aff-stat-label">মোট ওয়ালেট</div>
                </div>
            </div>

            {/* Top Referrers */}
            {topReferrers.length > 0 && topReferrers[0].totalEarnings > 0 && (
                <div className="admin-top-referrers">
                    <h4>🏆 টপ রেফারার</h4>
                    {topReferrers.map((a, i) => (
                        <div key={a.uid} className="admin-top-referrer-item">
                            <span className="admin-top-rank">#{i + 1}</span>
                            <span className="admin-top-name">{a.name}</span>
                            <span className="admin-top-amount">
                                {formatPrice(a.totalEarnings || 0)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Search */}
            <input
                type="text"
                className="admin-affiliate-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 নাম, ইমেইল বা কোড দিয়ে খুঁজুন..."
            />

            {/* List */}
            <div className="admin-affiliate-list">
                {loading ? (
                    <div className="admin-status">লোড হচ্ছে...</div>
                ) : filtered.length === 0 ? (
                    <div className="admin-status">
                        {search ? 'কিছু পাওয়া যায়নি।' : 'এখনো কোনো এফিলিয়েট নেই।'}
                    </div>
                ) : (
                    filtered.map((a) => (
                        <div key={a.uid} className="admin-affiliate-item">
                            <div className="admin-aff-item-head">
                                <div>
                                    <div className="admin-aff-name">
                                        {a.name}
                                    </div>
                                    <div className="admin-aff-code">
                                        🎁 {a.referralCode}
                                    </div>
                                </div>
                                <div className="admin-aff-balance">
                                    {formatPrice(a.walletBalance || 0)}
                                </div>
                            </div>

                            <div className="admin-aff-item-meta">
                                <span>📧 {a.email}</span>
                                <span>📞 {a.phone}</span>
                                <span>
                                    👥 {a.totalReferrals || 0} রেফারেল
                                </span>
                                <span>
                                    💰 {formatPrice(a.totalEarnings || 0)} আয়
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}