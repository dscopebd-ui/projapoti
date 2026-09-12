import { SITE } from '../data/siteConfig.js';

export default function TopBar() {
    return (
        <div className="top-bar">
            <div className="top-bar-info">
                <span>
                    📞 <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
                </span>
                <span>
                    ✉️ <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </span>
            </div>
            <div>নিরাপদ কেনাকাটা | নিশ্চিত সন্তুষ্টি</div>
        </div>
    );
}