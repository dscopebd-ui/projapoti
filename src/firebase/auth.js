import { auth } from './config.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';

export async function loginAdmin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutAdmin() {
    return signOut(auth);
}

export function watchAuth(callback) {
    return onAuthStateChanged(auth, callback);
}