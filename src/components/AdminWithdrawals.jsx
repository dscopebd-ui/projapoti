import { useState, useEffect } from 'react';
import {
    listenAllWithdrawals,
    approveWithdrawal,
    rejectWithdrawal
} from '../firebase/withdrawals.js';
import { formatPrice } from '../utils/formatPrice.js';

const METHOD_LABELS = {
    bkash: 'বিকাশ',
    nagad: 'নগদ',
    rocket: 'রকেট'
};

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    useEffect(() => {
        const unsub = listenAllWithdrawals(
            (list) => {
                setWithdrawals(list);
                setLoading(false);
            },
            () => setLoading(false)
        );
        return () => unsub();
    }, []);

    const pendingList = withdrawals.filter((w) => w.status === 'pending');
    const approvedList = withdrawals.filter((w) => w.status === 'approved');
    const rejectedList = withdrawals.filter((w) => w.status === 'rejected');

    const visibleList =
        filter === 'pending'
            ? pendingList
            : filter === 'approved'
            ? approvedList
            : rejectedList;

    const handleApprove = async (w) => {
        if (
            !confirm(
                `✅ "${w.name}" কে ${formatPrice(w.amount)} পাঠিয়েছেন?\n\n` +
                    `পদ্ধতি: ${METHOD_LABELS[w.method]}\n` +
                    `নাম্বার: ${w.phoneNumber}\n\n` +
                    `Confirm করলে status "Approved" হবে।`
            )
        )
            return;

        try {
            await approveWithdrawal(w.id, 'Approved by admin');
        } catch (err) {
            console.error(err);
            alert('সমস্যা: ' + err.message);
        }
    };

    const handleReject = async (w) => {
        const note = prompt('বাতিলের কারণ (ঐচ্ছিক):', '');
        if (note === null) return;

        if (
            !confirm(
                `❌ "${w.name}" এর রিকোয়েস্ট বাতিল করতে চান?\n\n` +
                    `৳ ${w.amount} তার ওয়ালেটে ফেরত যাবে।`
            )
        )
            return;

        try {
            await rejectWithdrawal(w.id, w.uid, w.amount, note || 'Rejected');
        } catch (err) {
            console.error(err);
            alert('সমস্যা: ' + err.message);
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

    const statusColors = {
        pending: '#ff9800',
        approved: '#16833b',
        rejected: '#b71c1c'
    };

    return (
        <div className="admin-section">
            <h3>💸 উইথড্র রিকোয়েস্ট</h3>

            <div className="admin-review-tabs">
                <button
                    type="button"
                    className={`admin-review-tab ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    ⏳ অপেক্ষমাণ ({pendingList.length})
                </button>
                <button
                    type="button"
                    className={`admin-review-tab ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    ✅ অনুমোদিত ({approvedList.length})
                </button>
                <button
                    type="button"
                    className={`admin-review-tab ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    ❌ বাতিল ({rejectedList.length})
                </button>
            </div>

            <div className="admin-withdraw-list">
                {loading ? (
                    <div className="admin-status">লোড হচ্ছে...</div>
                ) : visibleList.length === 0 ? (
                    <div className="admin-status">
                        কোনো রিকোয়েস্ট নেই।
                    </div>
                ) : (
                    visibleList.map((w) => (
                        <div key={w.id} className="admin-withdraw-item">
                            <div className="admin-withdraw-head">
                                <div>
                                    <div className="admin-withdraw-name">
                                        {w.name}
                                    </div>
                                    <div className="admin-withdraw-amount">
                                        {formatPrice(w.amount)}
                                    </div>
                                </div>
                                <div
                                    className="admin-withdraw-status"
                                    style={{ color: statusColors[w.status] }}
                                >
                                    {w.status === 'pending'
                                        ? '⏳ অপেক্ষমাণ'
                                        : w.status === 'approved'
                                        ? '✅ অনুমোদিত'
                                        : '❌ বাতিল'}
                                </div>
                            </div>

                            <div className="admin-withdraw-details">
                                <div>
                                    <span style={{ color: '#888' }}>পদ্ধতি:</span>{' '}
                                    <strong>{METHOD_LABELS[w.method] || w.method}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>নাম্বার:</span>{' '}
                                    <strong>{w.phoneNumber}</strong>
                                </div>
                                <div>
                                    <span style={{ color: '#888' }}>সময়:</span>{' '}
                                    {formatDate(w.requestedAt)}
                                </div>
                                {w.email && (
                                    <div>
                                        <span style={{ color: '#888' }}>ইমেইল:</span>{' '}
                                        {w.email}
                                    </div>
                                )}
                            </div>

                            {w.status === 'pending' && (
                                <div className="admin-withdraw-actions">
                                    <button
                                        type="button"
                                        className="admin-approve-btn"
                                        onClick={() => handleApprove(w)}
                                    >
                                        ✅ টাকা পাঠিয়েছি (Approve)
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-unapprove-btn"
                                        onClick={() => handleReject(w)}
                                    >
                                        ❌ বাতিল
                                    </button>
                                </div>
                            )}

                            {w.adminNote && w.status !== 'pending' && (
                                <div className="admin-withdraw-note">
                                    📝 {w.adminNote}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}