import { useState, useEffect } from 'react';
import {
    getPlatform,
    getYouTubeId,
    getYouTubeThumbnail
} from '../data/videos.js';

export default function VideoCard({ video, onClick, autoPlay, onClose }) {
    const [playing, setPlaying] = useState(false);

    const platform = getPlatform(video.url);
    const ytId = platform === 'youtube' ? getYouTubeId(video.url) : null;
    const thumbnail = ytId ? getYouTubeThumbnail(ytId) : null;

    /* ============================================================
       Reel / Shorts ডিটেকশন (case-insensitive + type priority)
       ============================================================ */
    const urlLower = (video.url || '').toLowerCase();
    const isReel =
        video.type === 'reel' ||
        video.type === 'shorts' ||
        urlLower.includes('reel') ||
        urlLower.includes('shorts') ||
        urlLower.includes('fb.watch');

    /* autoPlay মোডে সরাসরি চালু */
    useEffect(() => {
        if (autoPlay) {
            setPlaying(true);
        }
    }, [autoPlay]);

    /* ============================================================
       Embed URL তৈরি
       ============================================================ */
    const embedUrl = (() => {
        if (platform === 'youtube' && ytId) {
            return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
        }
        if (platform === 'facebook') {
            return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
                video.url
            )}&show_text=false&autoplay=true`;
        }
        return null;
    })();

    /* ============================================================
       বড় প্লেয়ার মোড (autoPlay)
       ============================================================ */
    if (autoPlay && playing && embedUrl) {
        return (
            <div
                className={`video-card video-card-playing ${
                    isReel ? 'is-reel' : 'is-video'
                }`}
                data-type={isReel ? 'reel' : 'video'}
            >
                <div className="video-embed">
                    <iframe
                        src={embedUrl}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        scrolling="no"
                    />
                </div>
                <div className="video-caption video-caption-playing">
                    <span className="video-title">{video.title}</span>
                    {onClose && (
                        <button
                            type="button"
                            className="video-close-btn"
                            onClick={onClose}
                        >
                            ✕ বন্ধ করুন
                        </button>
                    )}
                </div>
            </div>
        );
    }

    /* ============================================================
       থাম্বনেইল মোড
       ============================================================ */
    return (
        <div className="video-card" onClick={onClick}>
            <div className="video-thumbnail">
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt={video.title}
                        loading="lazy"
                    />
                ) : (
                    <div className="video-thumbnail-fallback">
                        <span className="video-platform-icon">
                            {platform === 'facebook' ? '📘' : '▶️'}
                        </span>
                        <span className="video-fallback-text">
                            {video.title}
                        </span>
                    </div>
                )}

                <div className="video-play-overlay">
                    <div className="video-play-icon">▶</div>
                </div>

                <div className="video-platform-badge">
                    {platform === 'facebook' ? '📘 Reel' : '▶️ YouTube'}
                </div>
            </div>

            <div className="video-caption">
                <span className="video-title">{video.title}</span>
            </div>
        </div>
    );
}