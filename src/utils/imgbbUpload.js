import { IMGBB_API_KEY } from '../data/siteConfig.js';

export async function uploadToImgBB(file) {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        { method: 'POST', body: formData }
    );

    const data = await res.json();

    if (!res.ok || !data.success || !data.data?.url) {
        throw new Error(
            data?.error?.message || 'ImgBB আপলোড ব্যর্থ হয়েছে'
        );
    }

    return data.data.url;
}