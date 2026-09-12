import { useEffect } from 'react';

export function useSEO({ title, description, image, url }) {
    useEffect(() => {
        const baseTitle = 'প্রজাপতি';
        const siteUrl = 'https://projapotishop.vercel.app';

        const setMeta = (selector, attr, value) => {
            if (!value) return;
            let el = document.querySelector(selector);
            if (!el) {
                el = document.createElement('meta');
                if (selector.includes('property')) {
                    el.setAttribute('property', selector.match(/"([^"]+)"/)[1]);
                } else {
                    el.setAttribute('name', selector.match(/"([^"]+)"/)[1]);
                }
                document.head.appendChild(el);
            }
            el.setAttribute(attr, value);
        };

        const setLink = (rel, href) => {
            let link = document.querySelector(`link[rel="${rel}"]`);
            if (!link) {
                link = document.createElement('link');
                link.setAttribute('rel', rel);
                document.head.appendChild(link);
            }
            link.setAttribute('href', href);
        };

        const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
        document.title = fullTitle;

        if (description) {
            setMeta('meta[name="description"]', 'content', description);
            setMeta('meta[property="og:description"]', 'content', description);
            setMeta('meta[name="twitter:description"]', 'content', description);
        }

        setMeta('meta[property="og:title"]', 'content', fullTitle);
        setMeta('meta[name="twitter:title"]', 'content', fullTitle);

        if (image) {
            setMeta('meta[property="og:image"]', 'content', image);
            setMeta('meta[name="twitter:image"]', 'content', image);
        }

        const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
        setMeta('meta[property="og:url"]', 'content', fullUrl);
        setLink('canonical', fullUrl);
    }, [title, description, image, url]);
}