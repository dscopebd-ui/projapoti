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

const COLLECTION = 'withdrawals';

/* ============================================================
   নতুন Withdraw Request
   ============================================================ */
export async function requestWithdrawal({
    uid,
    name,
    email,
    phone,
    method,
    phoneNumber,
    amount
}) {
    const ref = await addDoc(collection(db, COLLECTION), {
        uid,
        name,
        email,
        phone,
        method,        /* 'bkash', 'nagad', 'rocket' */
        phoneNumber,   /* যে নাম্বারে পাঠানো হবে */
        amount: Number(amount),
        status: 'pending',   /* pending, approved, rejected */
        requestedAt: serverTimestamp(),
        processedAt: null,
        adminNote: ''
    });

    /* ব্যালেন্স থেকে কেটে রাখা (Escrow) */
    await updateDoc(doc(db, 'affiliates', uid), {
        walletBalance: increment(-Number(amount))
    });

    return ref.id;
}

/* ============================================================
   ইউজারের Withdraw Requests
   ============================================================ */
export function listenUserWithdrawals(uid, callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        orderBy('requestedAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const all = snapshot.docs.map((d) => {
                const data = d.data() || {};
                return {
                    id: d.id,
                    uid: data.uid,
                    name: data.name || '',
                    method: data.method || '',
                    phoneNumber: data.phoneNumber || '',
                    amount: Number(data.amount) || 0,
                    status: data.status || 'pending',
                    adminNote: data.adminNote || '',
                    requestedAt: data.requestedAt?.toDate?.() || null,
                    processedAt: data.processedAt?.toDate?.() || null
                };
            });

            const filtered = all.filter((w) => w.uid === uid);
            callback(filtered);
        },
        (error) => {
            console.error('❌ Withdrawals listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   সব Withdraw Requests (Admin Panel-এর জন্য)
   ============================================================ */
export function listenAllWithdrawals(callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        orderBy('requestedAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const list = snapshot.docs.map((d) => {
                const data = d.data() || {};
                return {
                    id: d.id,
                    uid: data.uid,
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    method: data.method || '',
                    phoneNumber: data.phoneNumber || '',
                    amount: Number(data.amount) || 0,
                    status: data.status || 'pending',
                    adminNote: data.adminNote || '',
                    requestedAt: data.requestedAt?.toDate?.() || null,
                    processedAt: data.processedAt?.toDate?.() || null
                };
            });

            callback(list);
        },
        (error) => {
            console.error('❌ All withdrawals listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   Approve Withdraw
   ------------------------------------------------------------
   Admin ম্যানুয়ালি বিকাশ/নগদ/রকেট-এ টাকা পাঠাবে,
   তারপর এই ফাংশন কল করবে। Balance আগেই কেটে রাখা হয়েছে।
   ============================================================ */
export async function approveWithdrawal(withdrawalId, adminNote = '') {
    return updateDoc(doc(db, COLLECTION, withdrawalId), {
        status: 'approved',
        processedAt: serverTimestamp(),
        adminNote
    });
}

/* ============================================================
   Reject Withdraw
   ------------------------------------------------------------
   Balance ফেরত দিতে হবে।
   ============================================================ */
export async function rejectWithdrawal(
    withdrawalId,
    uid,
    amount,
    adminNote = ''
) {
    /* Status আপডেট */
    await updateDoc(doc(db, COLLECTION, withdrawalId), {
        status: 'rejected',
        processedAt: serverTimestamp(),
        adminNote
    });

    /* Balance ফেরত */
    await updateDoc(doc(db, 'affiliates', uid), {
        walletBalance: increment(Number(amount))
    });
}