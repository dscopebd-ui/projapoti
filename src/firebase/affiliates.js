import { auth, db } from './config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    serverTimestamp,
    increment
} from 'firebase/firestore';

const COLLECTION = 'affiliates';

/* ============================================================
   ইউনিক রেফারেল কোড তৈরি
   ============================================================ */
function generateReferralCode(name) {
    const clean = (name || 'USER')
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase()
        .slice(0, 6);

    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return (clean || 'USER') + random;
}

/* ============================================================
   নতুন কাস্টমার সাইনআপ
   ============================================================ */
export async function signupAffiliate({
    name,
    phone,
    email,
    password,
    referredBy
}) {
    /* ১. Firebase Auth-এ ইউজার তৈরি */
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );

    const uid = userCredential.user.uid;

    /* ২. ইউনিক রেফারেল কোড তৈরি (Duplicate চেক) */
    let referralCode = generateReferralCode(name);
    let attempts = 0;

    while (attempts < 5) {
        const q = query(
            collection(db, COLLECTION),
            where('referralCode', '==', referralCode)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) break;

        referralCode = generateReferralCode(name);
        attempts++;
    }

    /* ৩. Firestore-এ ইউজার ডেটা সেভ */
    await setDoc(doc(db, COLLECTION, uid), {
        uid,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        referralCode,
        referredBy: referredBy || null,
        walletBalance: 0,
        totalEarnings: 0,
        totalReferrals: 0,
        totalOrders: 0,
        createdAt: serverTimestamp()
    });

    return { uid, referralCode };
}

/* ============================================================
   কাস্টমার লগইন
   ============================================================ */
export async function loginAffiliate(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/* ============================================================
   কাস্টমার লগআউট
   ============================================================ */
export async function logoutAffiliate() {
    return signOut(auth);
}

/* ============================================================
   Auth State Listener
   ============================================================ */
export function watchAffiliateAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

/* ============================================================
   ইউজারের ডেটা আনা
   ============================================================ */
export async function getAffiliateData(uid) {
    const docRef = doc(db, COLLECTION, uid);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    return {
        uid: snap.id,
        ...snap.data()
    };
}

/* ============================================================
   ইউজারের ডেটা রিয়েল-টাইম লিসেন
   ============================================================ */
export function listenAffiliateData(uid, callback, onError) {
    const docRef = doc(db, COLLECTION, uid);

    return onSnapshot(
        docRef,
        (snap) => {
            if (!snap.exists()) {
                callback(null);
                return;
            }
            callback({
                uid: snap.id,
                ...snap.data()
            });
        },
        (error) => {
            console.error('❌ Affiliate listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   রেফারেল কোড দিয়ে ইউজার খোঁজা
   ============================================================ */
export async function findAffiliateByCode(referralCode) {
    if (!referralCode) return null;

    try {
        const q = query(
            collection(db, COLLECTION),
            where('referralCode', '==', referralCode.trim().toUpperCase())
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const docSnap = snapshot.docs[0];
        return {
            uid: docSnap.id,
            ...docSnap.data()
        };
    } catch (err) {
        console.error('❌ Find affiliate error:', err);
        return null;
    }
}

/* ============================================================
   কমিশন যোগ করা (ডেলিভারির পর)
   ============================================================ */
export async function addCommission(uid, amount) {
    try {
        await updateDoc(doc(db, COLLECTION, uid), {
            walletBalance: increment(amount),
            totalEarnings: increment(amount)
        });
        return true;
    } catch (err) {
        console.error('❌ Add commission error:', err);
        return false;
    }
}

/* ============================================================
   কাউন্টার বাড়ান (referrals, orders)
   ============================================================ */
export async function incrementAffiliateStats(uid, field) {
    try {
        await updateDoc(doc(db, COLLECTION, uid), {
            [field]: increment(1)
        });
    } catch (err) {
        console.error('❌ Increment stats error:', err);
    }
}

/* ============================================================
   সব এফিলিয়েট (Admin Panel-এর জন্য)
   ============================================================ */
export function listenAllAffiliates(callback, onError) {
    const q = query(collection(db, COLLECTION));

    return onSnapshot(
        q,
        (snapshot) => {
            const list = snapshot.docs.map((d) => ({
                uid: d.id,
                ...d.data()
            }));

            list.sort((a, b) => {
                const at = a.createdAt?.toMillis?.() || 0;
                const bt = b.createdAt?.toMillis?.() || 0;
                return bt - at;
            });

            callback(list);
        },
        (error) => {
            console.error('❌ Affiliates listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ============================================================
   URL থেকে ?ref= বের করা
   ============================================================ */
export function getReferralFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    return ref ? ref.trim().toUpperCase() : null;
}

/* ============================================================
   ?ref= মনে রাখা (localStorage-এ, ৩০ দিন)
   ============================================================ */
export function saveReferralToStorage(referralCode) {
    if (!referralCode) return;

    try {
        localStorage.setItem(
            'projapoti_referral',
            JSON.stringify({
                code: referralCode,
                timestamp: Date.now()
            })
        );
    } catch (err) {
        console.error('Save referral error:', err);
    }
}

export function getSavedReferral() {
    try {
        const saved = localStorage.getItem('projapoti_referral');
        if (!saved) return null;

        const data = JSON.parse(saved);

        /* ৩০ দিন পর বাতিল */
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp > thirtyDays) {
            localStorage.removeItem('projapoti_referral');
            return null;
        }

        return data.code;
    } catch {
        return null;
    }
}

export function clearSavedReferral() {
    try {
        localStorage.removeItem('projapoti_referral');
    } catch {}
}