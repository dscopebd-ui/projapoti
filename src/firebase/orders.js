import { db } from './config.js';
import {
    collection,
    addDoc,
    doc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    increment
} from 'firebase/firestore';
import { addCommission } from './affiliates.js';
import { getSettings } from './settings.js';

const COLLECTION = 'orders';

/* ============================================================
   নতুন অর্ডার সেভ
   ============================================================ */
export async function saveOrder(orderData) {
    const ref = await addDoc(collection(db, COLLECTION), {
        ...orderData,
        status: 'pending',
        createdAt: serverTimestamp(),
        deliveredAt: null,
        commissionPaid: false
    });
    return ref.id;
}

/* ============================================================
   সব অর্ডার রিয়েল-টাইম (Admin Panel-এর জন্য)
   ============================================================ */
export function listenOrders(callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const orders = snapshot.docs.map((d) => {
                const data = d.data() || {};
                return {
                    firebaseDocId: d.id,
                    orderId: data.orderId || '',
                    name: data.name || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    district: data.district || '',
                    items: data.items || [],
                    subtotal: Number(data.subtotal) || 0,
                    couponDiscount: Number(data.couponDiscount) || 0,
                    referralDiscount: Number(data.referralDiscount) || 0,
                    shipping: Number(data.shipping) || 0,
                    total: Number(data.total) || 0,
                    payment: data.payment || 'cod',
                    trxId: data.trxId || '',
                    status: data.status || 'pending',
                    referrerUid: data.referrerUid || null,
                    referrerCode: data.referrerCode || null,
                    commissionPaid: !!data.commissionPaid,
                    createdAt:
                        data.createdAt?.toDate?.() || null,
                    deliveredAt:
                        data.deliveredAt?.toDate?.() || null
                };
            });

            callback(orders);
        },
        (error) => {
            console.error('❌ Orders listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   অর্ডার Status পরিবর্তন
   ============================================================ */
export async function updateOrderStatus(orderDocId, status) {
    const update = { status };

    if (status === 'delivered') {
        update.deliveredAt = serverTimestamp();
    }

    return updateDoc(doc(db, COLLECTION, orderDocId), update);
}

/* ============================================================
   Order Deliver + Commission Pay
   ============================================================ */
export async function markOrderDelivered(orderDocId, order) {
    /* ১. Status update */
    await updateDoc(doc(db, COLLECTION, orderDocId), {
        status: 'delivered',
        deliveredAt: serverTimestamp(),
        commissionPaid: true
    });

    /* ২. কমিশন জমা */
    if (order.referrerUid && !order.commissionPaid) {
        const settings = await getSettings();
        const commission =
            Math.round(
                (order.subtotal *
                    settings.referrerCommissionPercent) /
                    100
            );

        if (commission > 0) {
            /* Referrer-এর ওয়ালেটে যোগ */
            await addCommission(order.referrerUid, commission);

            /* Referrer-এর totalReferrals + totalOrders বাড়ানো */
            await updateDoc(
                doc(db, 'affiliates', order.referrerUid),
                {
                    totalReferrals: increment(1),
                    totalOrders: increment(1)
                }
            );
        }
    }
}