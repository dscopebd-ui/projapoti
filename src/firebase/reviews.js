import { db } from './config.js';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION = 'reviews';

/* ============================================================
   নতুন রিভিউ যোগ করা
   ============================================================ */
export async function addReview({
    productId,
    productName,
    customerName,
    customerPhone,
    rating,
    comment
}) {
    const ref = await addDoc(collection(db, COLLECTION), {
        productId: String(productId),
        productName: String(productName || ''),
        customerName: String(customerName).trim(),
        customerPhone: String(customerPhone || '').trim(),
        rating: Number(rating),
        comment: String(comment).trim(),
        approved: false,
        createdAt: serverTimestamp()
    });
    return ref.id;
}

/* ============================================================
   একটা প্রোডাক্টের সব approve করা রিভিউ (realtime)
   ============================================================ */
export function listenProductReviews(productId, callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        where('productId', '==', String(productId)),
        where('approved', '==', true)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const reviews = snapshot.docs.map((d) => {
                const data = d.data() || {};
                const created =
                    data.createdAt && data.createdAt.toDate
                        ? data.createdAt.toDate()
                        : null;
                return {
                    id: d.id,
                    productId: data.productId,
                    productName: data.productName || '',
                    customerName: data.customerName || '',
                    customerPhone: data.customerPhone || '',
                    rating: Number(data.rating) || 0,
                    comment: data.comment || '',
                    approved: !!data.approved,
                    createdAt: created
                };
            });

            /* নতুন রিভিউ আগে */
            reviews.sort((a, b) => {
                const at = a.createdAt ? a.createdAt.getTime() : 0;
                const bt = b.createdAt ? b.createdAt.getTime() : 0;
                return bt - at;
            });

            callback(reviews);
        },
        (error) => {
            console.error('❌ Reviews listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   সব রিভিউ (অ্যাডমিন প্যানেলের জন্য — realtime)
   ============================================================ */
export function listenAllReviews(callback, onError) {
    const q = query(collection(db, COLLECTION));

    return onSnapshot(
        q,
        (snapshot) => {
            const reviews = snapshot.docs.map((d) => {
                const data = d.data() || {};
                const created =
                    data.createdAt && data.createdAt.toDate
                        ? data.createdAt.toDate()
                        : null;
                return {
                    id: d.id,
                    productId: data.productId,
                    productName: data.productName || '',
                    customerName: data.customerName || '',
                    customerPhone: data.customerPhone || '',
                    rating: Number(data.rating) || 0,
                    comment: data.comment || '',
                    approved: !!data.approved,
                    createdAt: created
                };
            });

            /* নতুন আগে */
            reviews.sort((a, b) => {
                const at = a.createdAt ? a.createdAt.getTime() : 0;
                const bt = b.createdAt ? b.createdAt.getTime() : 0;
                return bt - at;
            });

            callback(reviews);
        },
        (error) => {
            console.error('❌ All reviews listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   Approve / Unapprove
   ============================================================ */
export async function setReviewApproved(reviewId, approved) {
    return updateDoc(doc(db, COLLECTION, reviewId), {
        approved: !!approved
    });
}

/* ============================================================
   Delete
   ============================================================ */
export async function deleteReview(reviewId) {
    return deleteDoc(doc(db, COLLECTION, reviewId));
}

/* ============================================================
   Average rating গণনা
   ============================================================ */
export function calcAverageRating(reviews) {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const total = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return {
        average: total / reviews.length,
        count: reviews.length
    };
}

/* ============================================================
   সব Approved রিভিউ (হোমপেজ + AggregateRating-এর জন্য)
   ============================================================ */
export function listenApprovedReviews(callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        where('approved', '==', true)
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const reviews = snapshot.docs.map((d) => {
                const data = d.data() || {};
                const created =
                    data.createdAt && data.createdAt.toDate
                        ? data.createdAt.toDate()
                        : null;
                return {
                    id: d.id,
                    productId: data.productId,
                    productName: data.productName || '',
                    customerName: data.customerName || '',
                    customerPhone: data.customerPhone || '',
                    rating: Number(data.rating) || 0,
                    comment: data.comment || '',
                    approved: true,
                    createdAt: created
                };
            });

            /* নতুন আগে */
            reviews.sort((a, b) => {
                const at = a.createdAt ? a.createdAt.getTime() : 0;
                const bt = b.createdAt ? b.createdAt.getTime() : 0;
                return bt - at;
            });

            callback(reviews);
        },
        (error) => {
            console.error('❌ Approved reviews error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   Overall Rating Summary (হেডার ব্যাজের জন্য)
   ============================================================ */
export function calcOverallRating(reviews) {
    if (!reviews || reviews.length === 0) {
        return { average: 0, count: 0 };
    }

    const total = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    return {
        average: Math.round((total / reviews.length) * 10) / 10,
        count: reviews.length
    };
}