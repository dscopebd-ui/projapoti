import { db } from './config.js';
import {
    doc,
    getDoc,
    setDoc,
    onSnapshot
} from 'firebase/firestore';

const SETTINGS_DOC = 'settings/affiliateConfig';

/* ============================================================
   ডিফল্ট সেটিংস
   ============================================================ */
const DEFAULT_SETTINGS = {
    customerDiscountPercent: 10,
    referrerCommissionPercent: 5,
    minWithdrawal: 50
};

/* ============================================================
   সেটিংস লোড (রিয়েল-টাইম)
   ============================================================ */
export function listenSettings(callback, onError) {
    const docRef = doc(db, 'settings', 'affiliateConfig');

    return onSnapshot(
        docRef,
        (snap) => {
            if (!snap.exists()) {
                callback(DEFAULT_SETTINGS);
                return;
            }
            const data = snap.data() || {};
            callback({
                customerDiscountPercent:
                    Number(data.customerDiscountPercent) ||
                    DEFAULT_SETTINGS.customerDiscountPercent,
                referrerCommissionPercent:
                    Number(data.referrerCommissionPercent) ||
                    DEFAULT_SETTINGS.referrerCommissionPercent,
                minWithdrawal:
                    Number(data.minWithdrawal) ||
                    DEFAULT_SETTINGS.minWithdrawal
            });
        },
        (error) => {
            console.error('❌ Settings listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   সেটিংস একবার লোড
   ============================================================ */
export async function getSettings() {
    try {
        const snap = await getDoc(doc(db, 'settings', 'affiliateConfig'));
        if (!snap.exists()) return DEFAULT_SETTINGS;

        const data = snap.data() || {};
        return {
            customerDiscountPercent:
                Number(data.customerDiscountPercent) ||
                DEFAULT_SETTINGS.customerDiscountPercent,
            referrerCommissionPercent:
                Number(data.referrerCommissionPercent) ||
                DEFAULT_SETTINGS.referrerCommissionPercent,
            minWithdrawal:
                Number(data.minWithdrawal) ||
                DEFAULT_SETTINGS.minWithdrawal
        };
    } catch (err) {
        console.error('Get settings error:', err);
        return DEFAULT_SETTINGS;
    }
}

/* ============================================================
   সেটিংস সেভ (Admin)
   ============================================================ */
export async function saveSettings({
    customerDiscountPercent,
    referrerCommissionPercent,
    minWithdrawal
}) {
    return setDoc(
        doc(db, 'settings', 'affiliateConfig'),
        {
            customerDiscountPercent: Number(customerDiscountPercent),
            referrerCommissionPercent: Number(referrerCommissionPercent),
            minWithdrawal: Number(minWithdrawal),
            updatedAt: new Date()
        },
        { merge: true }
    );
}