/* ============================================================
   ভিডিও সেকশন — এখানে লিংক যোগ/পরিবর্তন করুন
   ============================================================
   
   টাইপ:
   - 'reel'  → লম্বা (৯:১৬) — Facebook Reels, YouTube Shorts
   - 'video' → চওড়া (১৬:৯) — Regular YouTube video
   ============================================================ */

export const videos = [
    {
        id: 1,
        url: 'https://www.facebook.com/reel/2065697380741810',
        title: 'স্মার্ট ওয়াচ রিভিউ',
        type: 'reel'
    },
    {
        id: 2,
        url: 'https://youtu.be/dQw4w9WgXcQ',
        title: 'লেদার ওয়ালেট আনবক্সিং',
        type: 'video'
    },
    {
        id: 3,
        url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
        title: 'হেডফোন সাউন্ড টেস্ট',
        type: 'video'
    }
];

/* ============================================================
   Helper Functions
   ============================================================ */

export function getPlatform(url) {
    if (!url) return null;

    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        return 'youtube';
    }
    if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
        return 'facebook';
    }
    return null;
}

export function getYouTubeId(url) {
    if (!url) return null;

    let match = url.match(/youtu\.be\/([^?&]+)/);
    if (match) return match[1];

    match = url.match(/[?&]v=([^?&]+)/);
    if (match) return match[1];

    match = url.match(/shorts\/([^?&]+)/);
    if (match) return match[1];

    match = url.match(/embed\/([^?&]+)/);
    if (match) return match[1];

    return null;
}

export function getYouTubeThumbnail(videoId) {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}