import { useState } from 'react';
import { requestWithdrawal } from '../firebase/withdrawals.js';
import { formatPrice } from '../utils/formatPrice.js';
import { useAffiliate } from '../context/AffiliateContext.jsx';

const METHODS = [
    { id: 'bkash', label: 'বিকাশ', color: '#e2136e' },
    { id: 'nagad', label: 'নগদ', color: '#f6921e' },
    { id: 'rocket', label: 'রকেট', color: '#8c3494' }
];

export default function WithdrawModal({
    open,
    onClose,
    walletBalance,
    minWithdrawal = 50,
    onSuccess
}) {
    const { user } = useAffiliate();

    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('bkash');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!open || !user) return null;

    const resetForm = () => {
        setAmount('');
        setMethod('bkash');
        setPhoneNumber('');
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        /* Validation */
        const amt = Number(amount);

        if (!amt || amt <= 0) {
            setError('সঠিক পরিমাণ লিখুন');
            return;
        }

        if (amt < minWithdrawal) {
            setError(`সর্বনিম্ন ${formatPrice(minWithdrawal)} উইথড্র করা যাবে`);
            return;
        }

        if (amt > walletBalance) {
            setError('আপনার ওয়ালেটে পর্যাপ্ত টাকা নেই');
            return;
        }

        if (!phoneNumber.trim() || phoneNumber.trim().length < 11) {
            setError('সঠিক মোবাইল নাম্বার লিখুন');
            return;
        }

        setLoading(true);

        try {
            await requestWithdrawal({
                uid: user.uid,
                name: user.name,
                email: user.email,
                phone: user.phone,
                method,
                phoneNumber: phoneNumber.trim(),
                amount: amt
            });

            setSuccess('✅ উইথড্র রিকোয়েস্ট পাঠানো হয়েছে!');
            resetForm();

            if (onSuccess) onSuccess();

            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            setError('❌ রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        resetForm();
        onClose();
    };

    const selectedMethod = METHODS.find((m) => m.id === method);

    return (
        <div className="modal-overlay open" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button
                    type="button"
                    className="withdraw-close-btn"
                    onClick={handleClose}
                >
                    ✕
                </button>

                <h3>💸 উইথড্র রিকোয়েস্ট</h3>
                <div className="sub">
                    আপনার ওয়ালেট থেকে টাকা তুলুন
                </div>

                {success ? (
                    <div className="withdraw-success-box">
                        <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>✅</div>
                        <h4 style={{ color: '#16833b', marginBottom: 8 }}>
                            রিকোয়েস্ট পাঠানো হয়েছে!
                        </h4>
                        <p style={{ color: '#666', fontSize: '0.9rem' }}>
                            অ্যাডমিন যাচাই করে ২৪ ঘণ্টার মধ্যে আপনার নাম্বারে টাকা পাঠাবেন।
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="withdraw-balance-info">
                            <div className="withdraw-balance-label">
                                💰 বর্তমান ব্যালেন্স
                            </div>
                            <div className="withdraw-balance-value">
                                {formatPrice(walletBalance)}
                            </div>
                        </div>

                        {error && (
                            <div className="withdraw-error">{error}</div>
                        )}

                        <div className="field">
                            <label>পরিমাণ (৳)</label>
                            <input
                                type="number"
                                min={minWithdrawal}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder={String(minWithdrawal)}
                                required
                            />
                            <div className="withdraw-hint">
                                সর্বনিম্ন: {formatPrice(minWithdrawal)} • সর্বোচ্চ: {formatPrice(walletBalance)}
                            </div>
                        </div>

                        <div className="field">
                            <label>পেমেন্ট মাধ্যম</label>
                            <div className="withdraw-methods">
                                {METHODS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        className={`withdraw-method-btn ${
                                            method === m.id ? 'active' : ''
                                        }`}
                                        style={{
                                            borderColor:
                                                method === m.id
                                                    ? m.color
                                                    : undefined,
                                            background:
                                                method === m.id
                                                    ? m.color
                                                    : undefined,
                                            color:
                                                method === m.id
                                                    ? '#fff'
                                                    : undefined
                                        }}
                                        onClick={() => setMethod(m.id)}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="field">
                            <label>
                                {selectedMethod?.label} নাম্বার
                            </label>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="01XXXXXXXXX"
                                maxLength={15}
                                required
                            />
                            <div className="withdraw-hint">
                                এই নাম্বারে টাকা পাঠানো হবে
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="place-order-btn"
                            disabled={loading}
                        >
                            {loading ? '⏳ পাঠানো হচ্ছে...' : '💸 রিকোয়েস্ট পাঠান'}
                        </button>

                        <span className="modal-cancel" onClick={handleClose}>
                            বাতিল করুন
                        </span>
                    </form>
                )}
            </div>
        </div>
    );
}