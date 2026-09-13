import { useState } from 'react';
import { videos } from '../data/videos.js';
import VideoCard from './VideoCard.jsx';

export default function VideoSection() {
    const [activeVideoId, setActiveVideoId] = useState(null);

    /* কোনো ভিডিও না থাকলে সেকশন দেখাবো না */
    if (!videos || videos.length === 0) {
        return null;
    }

    const activeVideo = videos.find((v) => v.id === activeVideoId);

    /* ============================================
       একটা ভিডিও চলছে — শুধু সেটাই দেখাই
       ============================================ */
    if (activeVideo) {
        return (
            <div className="video-section">
                <h2 className="section-title">🎬 আমাদের ভিডিও</h2>

                <div className="video-single-view">
                    <VideoCard
                        video={activeVideo}
                        autoPlay
                        onClose={() => setActiveVideoId(null)}
                    />
                </div>
            </div>
        );
    }

    /* ============================================
       কোনো ভিডিও চলছে না — সব থাম্বনেইল দেখাই
       ============================================ */
    return (
        <div className="video-section">
            <h2 className="section-title">🎬 আমাদের ভিডিও</h2>

            <div className="video-grid">
                {videos.map((v) => (
                    <VideoCard
                        key={v.id}
                        video={v}
                        onClick={() => setActiveVideoId(v.id)}
                    />
                ))}
            </div>
        </div>
    );
}