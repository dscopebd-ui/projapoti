import { db } from './config.js';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    serverTimestamp,
    increment
} from 'firebase/firestore';

const COLLECTION = 'coupons';

/* ============================================================
   সব কুপন লিসেন (Admin Panel-এর জন্য)
   ============================================================ */
export function listenCoupons(callback, onError) {
    const q = query(collection(db, COLLECTION));

    return onSnapshot(
        q,
        (snapshot) => {
            const coupons = snapshot.docs.map((d) => {
                const data = d.data() || {};
                const expiresAt =
                    data.expiresAt && data.expiresAt.toDate
                        ? data.expiresAt.toDate()
                        : null;
                const createdAt =
                    data.createdAt && data.createdAt.toDate
                        ? data.createdAt.toDate()
                        : null;

                return {
                    id: d.id,
                    code: (data.code || '').toUpperCase(),
                    discountType: data.discountType || 'percent',
                    discountValue: Number(data.discountValue) || 0,
                    minOrder: Number(data.minOrder) || 0,
                    maxUses: Number(data.maxUses) || 0,
                    usedCount: Number(data.usedCount) || 0,
                    active: data.active !== false,
                    expiresAt,
                    createdAt
                };
            });

            coupons.sort((a, b) => {
                const at = a.createdAt ? a.createdAt.getTime() : 0;
                const bt = b.createdAt ? b.createdAt.getTime() : 0;
                return bt - at;
            });

            callback(coupons);
        },
        (error) => {
            console.error('❌ Coupons listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   নতুন কুপন তৈরি
   ============================================================ */
export async function addCoupon({
    code,
    discountType,
    discountValue,
    minOrder,
    maxUses,
    expiresAt
}) {
    const ref = await addDoc(collection(db, COLLECTION), {
        code: code.trim().toUpperCase(),
        discountType: discountType || 'percent',
        discountValue: Number(discountValue) || 0,
        minOrder: Number(minOrder) || 0,
        maxUses: Number(maxUses) || 0,
        usedCount: 0,
        active: true,
        expiresAt: expiresAt || null,
        createdAt: serverTimestamp()
    });
    return ref.id;
}

/* ============================================================
   কুপন ডিলিট
   ============================================================ */
export async function deleteCoupon(couponId) {
    return deleteDoc(doc(db, COLLECTION, couponId));
}

/* ============================================================
   কুপন Active/Inactive toggle
   ============================================================ */
export async function setCouponActive(couponId, active) {
    return updateDoc(doc(db, COLLECTION, couponId), {
        active: !!active
    });
}

/* ============================================================
   কুপন ভ্যালিডেট + ডিসকাউন্ট ক্যালকুলেট
   ============================================================ */
export async function validateCoupon(code, subtotal) {
    const normalizedCode = (code || '').trim().toUpperCase();

    if (!normalizedCode) {
        return { valid: false, error: 'কুপন কোড লিখুন' };
    }

    try {
        const q = query(
            collection(db, COLLECTION),
            where('code', '==', normalizedCode)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { valid: false, error: '❌ এই কোডটি সঠিক নয়' };
        }

        const couponDoc = snapshot.docs[0];
        const data = couponDoc.data() || {};

        if (data.active === false) {
            return { valid: false, error: '❌ এই কুপনটি এখন বন্ধ আছে' };
        }

        if (data.expiresAt && data.expiresAt.toDate) {
            const expiry = data.expiresAt.toDate();
            if (expiry < new Date()) {
                return { valid: false, error: '❌ এই কুপনটির মেয়াদ শেষ হয়ে গেছে' };
            }
        }

        const maxUses = Number(data.maxUses) || 0;
        const usedCount = Number(data.usedCount) || 0;

        if (maxUses > 0 && usedCount >= maxUses) {
            return { valid: false, error: '❌ এই কুপনটির ব্যবহারের সীমা শেষ' };
        }

        const minOrder = Number(data.minOrder) || 0;
        if (minOrder > 0 && subtotal < minOrder) {
            return {
                valid: false,
                error: `❌ এই কুপন ব্যবহার করতে কমপক্ষে ৳${minOrder} অর্ডার করতে হবে`
            };
        }

        const discountType = data.discountType || 'percent';
        const discountValue = Number(data.discountValue) || 0;

        let discount = 0;
        if (discountType === 'percent') {
            discount = Math.round((subtotal * discountValue) / 100);
        } else {
            discount = Math.min(discountValue, subtotal);
        }

        return {
            valid: true,
            coupon: {
                id: couponDoc.id,
                code: data.code || normalizedCode,
                discountType,
                discountValue,
                minOrder,
                maxUses,
                usedCount
            },
            discount
        };
    } catch (err) {
        console.error('❌ Coupon validation error:', err);
        return { valid: false, error: 'কুপন যাচাই করতে সমস্যা হয়েছে' };
    }
}

/* ============================================================
   কুপনের ব্যবহার বাড়ান
   ============================================================ */
export async function incrementCouponUsage(couponId) {
    try {
        return await updateDoc(doc(db, COLLECTION, couponId), {
            usedCount: increment(1)
        });
    } catch (err) {
        console.error('❌ Coupon usage increment error:', err);
    }
}