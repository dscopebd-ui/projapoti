/**
 * Cloudinary Upload
 * ----------------------------------------------------
 * ImgBB-র বদলে Cloudinary-তে ছবি আপলোড করে।
 * সুবিধা:
 *   - অটো WebP (f_auto)
 *   - অটো quality (q_auto)
 *   - CDN delivery (দ্রুত)
 *   - ২৫ GB ফ্রি storage
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Cloudinary-তে ছবি আপলোড করে
 * @param {File} file — ছবির ফাইল
 * @returns {Promise<string>} — অটো-optimized ছবির URL
 */
export async function uploadToCloudinary(file) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error(
            'Cloudinary config missing — .env চেক করুন'
        );
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', 'products');

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    const data = await res.json();

    if (!res.ok || !data.secure_url) {
        throw new Error(
            data?.error?.message || 'Cloudinary আপলোড ব্যর্থ হয়েছে'
        );
    }

    /* ------------------------------
       Auto-optimize URL তৈরি
       ------------------------------
       f_auto  → অটো WebP/AVIF
       q_auto  → অটো quality (৩০-৫০% ছোট)
       w_800   → max width ৮০০px (সাইটে এতটুকুই যথেষ্ট)
       c_limit → aspect ratio রাখে
    ------------------------------ */
    const optimizedUrl = data.secure_url.replace(
        '/image/upload/',
        '/image/upload/f_auto,q_auto,w_800,c_limit/'
    );

    return optimizedUrl;
}

/**
 * Cloudinary URL-এ থাম্বনেইল সাইজ যোগ করে
 * @param {string} url — মূল Cloudinary URL
 * @param {number} size — সাইজ (px)
 * @returns {string} — থাম্বনেইল URL
 */
export function cloudinaryThumbnail(url, size = 300) {
    if (!url || !url.includes('cloudinary.com')) return url;

    return url.replace(
        '/image/upload/',
        `/image/upload/f_auto,q_auto,w_${size},c_fill/`
    );
}