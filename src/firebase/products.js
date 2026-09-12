import { db } from './config.js';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

const COLLECTION = 'products';

/* ---------- সব প্রোডাক্ট রিয়েল-টাইম লিসেন ---------- */
export function listenProducts(callback, onError) {
    const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const products = snapshot.docs.map((d) => {
                const data = d.data() || {};
                return {
                    firebaseDocId: d.id,
                    id: Number(data.id) || Date.now() + Math.random(),
                    name: data.name || 'নাম নেই',
                    cat: data.cat || 'গ্যাজেট',
                    price: Number(data.price) || 0,
                    oldPrice: Number(data.oldPrice) || 0,
                    img: data.img || '',
                    images:
                        Array.isArray(data.images) && data.images.length
                            ? data.images
                            : [data.img].filter(Boolean),
                    desc: data.desc || '',
                    benefits: Array.isArray(data.benefits)
                        ? data.benefits
                        : [],
                    specs: data.specs || {},
                    createdBy: data.createdBy || ''
                };
            });
            callback(products);
        },
        (error) => {
            console.error('❌ Firestore listen error:', error);
            if (onError) onError(error);
        }
    );
}

/* ---------- নতুন প্রোডাক্ট যোগ ---------- */
export async function addProduct(productData, uid) {
    const ref = await addDoc(collection(db, COLLECTION), {
        ...productData,
        createdAt: serverTimestamp(),
        createdBy: uid
    });
    return ref.id;
}

/* ---------- প্রোডাক্ট ডিলিট ---------- */
export async function deleteProduct(docId) {
    return deleteDoc(doc(db, COLLECTION, docId));
}