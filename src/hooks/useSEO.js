import { useEffect } from 'react';

/**
 * useSEO — dynamic title, description, og tags আপডেট করে
 *
 * ব্যবহার:
 *   useSEO({
 *     title: 'প্রোডাক্টের নাম',
 *     description: 'বিবরণ',
 *     image: 'ছবির URL',
 *     url: 'প্রোডাক্টের URL'
 *   });
 */
export function useSEO({ title, description, image, url }) {
    useEffect(() => {
        if (!title && !description) return;

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

        /* ---- Title ---- */
        const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
        document.title = fullTitle;

        /* ---- Meta description ---- */
        if (description) {
            setMeta('meta[name="description"]', 'content', description);
            setMeta('meta[property="og:description"]', 'content', description);
            setMeta('meta[name="twitter:description"]', 'content', description);
        }

        /* ---- OG title ---- */
        setMeta('meta[property="og:title"]', 'content', fullTitle);
        setMeta('meta[name="twitter:title"]', 'content', fullTitle);

        /* ---- OG image ---- */
        if (image) {
            setMeta('meta[property="og:image"]', 'content', image);
            setMeta('meta[name="twitter:image"]', 'content', image);
        }

        /* ---- URL / canonical ---- */
        const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
        setMeta('meta[property="og:url"]', 'content', fullUrl);
        setLink('canonical', fullUrl);
    }, [title, description, image, url]);
}