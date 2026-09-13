import { useState, useEffect } from 'react';
import { listenSettings, saveSettings } from '../firebase/settings.js';

export default function AdminAffiliateSettings() {
    const [customerDiscount, setCustomerDiscount] = useState('');
    const [referrerCommission, setReferrerCommission] = useState('');
    const [minWithdrawal, setMinWithdrawal] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /* Settings লোড */
    useEffect(() => {
        const unsub = listenSettings(
            (s) => {
                setCustomerDiscount(String(s.customerDiscountPercent));
                setReferrerCommission(String(s.referrerCommissionPercent));
                setMinWithdrawal(String(s.minWithdrawal));
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const disc = Number(customerDiscount);
        const comm = Number(referrerCommission);
        const minW = Number(minWithdrawal);

        if (disc < 0 || disc > 100) {
            setError('ছাড় ০-১০০% এর মধ্যে হতে হবে');
            return;
        }
        if (comm < 0 || comm > 100) {
            setError('কমিশন ০-১০০% এর মধ্যে হতে হবে');
            return;
        }
        if (minW < 0) {
            setError('সর্বনিম্ন উইথড্র ০ এর কম হতে পারে না');
            return;
        }

        setSaving(true);

        try {
            await saveSettings({
                customerDiscountPercent: disc,
                referrerCommissionPercent: comm,
                minWithdrawal: minW
            });
            setSuccess('✅ সেটিংস সেভ হয়েছে!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error(err);
            setError('❌ সেভ করতে সমস্যা হয়েছে');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-section">
                <h3>⚙️ এফিলিয়েট সেটিংস</h3>
                <div className="admin-status">লোড হচ্ছে...</div>
            </div>
        );
    }

    return (
        <div className="admin-section">
            <h3>⚙️ এফিলিয়েট সেটিংস</h3>

            <form onSubmit={handleSubmit} className="admin-coupon-form">
                {error && <div className="admin-error-msg show">{error}</div>}
                {success && <div className="admin-success-msg show">{success}</div>}

                <div className="admin-row">
                    <div className="admin-field">
                        <label>🎁 কাস্টমার ছাড় (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={customerDiscount}
                            onChange={(e) => setCustomerDiscount(e.target.value)}
                            placeholder="10"
                            required
                        />
                        <div className="hint">
                            নতুন কাস্টমার রেফারেলে এত % ছাড় পাবে
                        </div>
                    </div>

                    <div className="admin-field">
                        <label>💰 রেফারার কমিশন (%)</label>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={referrerCommission}
                            onChange={(e) => setReferrerCommission(e.target.value)}
                            placeholder="5"
                            required
                        />
                        <div className="hint">
                            অর্ডার হলে রেফারার এত % কমিশন পাবে
                        </div>
                    </div>
                </div>

                <div className="admin-field">
                    <label>💸 সর্বনিম্ন উইথড্র (৳)</label>
                    <input
                        type="number"
                        min="0"
                        value={minWithdrawal}
                        onChange={(e) => setMinWithdrawal(e.target.value)}
                        placeholder="50"
                        required
                    />
                    <div className="hint">
                        এই পরিমাণের কম হলে উইথড্র করা যাবে না
                    </div>
                </div>

                <button
                    type="submit"
                    className="admin-submit"
                    disabled={saving}
                >
                    {saving ? '⏳ সেভ হচ্ছে...' : '💾 সেটিংস সেভ করুন'}
                </button>
            </form>
        </div>
    );
}