import { SITE } from '../data/siteConfig.js';

export default function Banner() {
    return (
        <div className="banner-container" id="home">
            <img
                src={SITE.bannerImg}
                alt={`${SITE.name} Banner`}
                className="main-banner"
            />
        </div>
    );
}