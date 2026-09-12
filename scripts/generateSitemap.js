/**
 * Dynamic Sitemap Generator
 * ----------------------------------------------------
 * Vercel build-এর সময় চলে।
 * Firebase Firestore REST API দিয়ে সব প্রোডাক্ট পড়ে
 * public/sitemap.xml ফাইল অটো তৈরি করে।
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   Load .env ফাইল (Vite-এর মতো)
   ============================================================ */
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env');
    if (!fs.existsSync(envPath)) {
        console.warn('⚠️  .env file not found at', envPath);
        return {};
    }

    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach((line) => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;

        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });

    return env;
}

const localEnv = loadEnv();

/* ---------- Configuration ---------- */
const SITE_URL = 'https://projapotishop.vercel.app';
const PROJECT_ID =
    process.env.VITE_FIREBASE_PROJECT_ID ||
    localEnv.VITE_FIREBASE_PROJECT_ID ||
    'projapoti-666dd';
const API_KEY =
    process.env.VITE_FIREBASE_API_KEY ||
    localEnv.VITE_FIREBASE_API_KEY;

console.log(`🔑 API Key: ${API_KEY ? '✅ Found' : '❌ Missing'}`);
console.log(`📁 Project: ${PROJECT_ID}`);

/* ---------- বাংলা → ইংরেজি Slug ---------- */
function slugify(text) {
    if (!text) return '';

    const banglaMap = {
        অ: 'o', আ: 'a', ই: 'i', ঈ: 'i', উ: 'u', ঊ: 'u', ঋ: 'ri',
        এ: 'e', ঐ: 'oi', ও: 'o', ঔ: 'ou',
        ক: 'k', খ: 'kh', গ: 'g', ঘ: 'gh', ঙ: 'ng',
        চ: 'ch', ছ: 'chh', জ: 'j', ঝ: 'jh', ঞ: 'n',
        ট: 't', ঠ: 'th', ড: 'd', ঢ: 'dh', ণ: 'n',
        ত: 't', থ: 'th', দ: 'd', ধ: 'dh', ন: 'n',
        প: 'p', ফ: 'ph', ব: 'b', ভ: 'bh', ম: 'm',
        য: 'j', র: 'r', ল: 'l', শ: 'sh', ষ: 'sh', স: 's', হ: 'h',
        ড়: 'r', ঢ়: 'rh', য়: 'y',
        'ং': 'ng', 'ঃ': 'h', 'ঁ': '',
        'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u',
        'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou',
        '্': ''
    };

    let result = '';
    for (const char of text) {
        if (banglaMap[char] !== undefined) {
            result += banglaMap[char];
        } else {
            result += char;
        }
    }

    return result
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
}

/* ---------- Firestore থেকে সব প্রোডাক্ট আনা ---------- */
async function fetchProducts() {
    if (!API_KEY) {
        console.warn('⚠️  API Key missing — only home page will be in sitemap');
        return [];
    }

    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?key=${API_KEY}&pageSize=1000`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.warn(`⚠️  Firestore fetch failed: ${res.status} ${res.statusText}`);
            return [];
        }

        const data = await res.json();
        const docs = data.documents || [];

        return docs.map((doc) => {
            const fields = doc.fields || {};
            const id =
                fields.id?.integerValue ||
                fields.id?.stringValue ||
                doc.name.split('/').pop();
            const name = fields.name?.stringValue || '';
            return { id, name };
        });
    } catch (err) {
        console.warn('⚠️  Firestore fetch error:', err.message);
        return [];
    }
}

/* ---------- Sitemap XML তৈরি ---------- */
function buildSitemap(products) {
    const now = new Date().toISOString().split('T')[0];

    const urls = [
        `  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`
    ];

    products.forEach((p) => {
        const slug = slugify(p.name);
        const url = `${SITE_URL}/product/${slug}-${p.id}`;

        urls.push(`  <url>
    <loc>${url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
}

/* ---------- Main ---------- */
async function main() {
    console.log('🗺️  Generating dynamic sitemap...');

    const products = await fetchProducts();
    console.log(`📦 Found ${products.length} products`);

    const sitemap = buildSitemap(products);

    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, sitemap, 'utf8');

    console.log(`✅ Sitemap written to ${outputPath}`);
    console.log(`📝 Total URLs: ${products.length + 1}`);
}

main().catch((err) => {
    console.error('❌ Sitemap generation failed:', err);
    const fallback = buildSitemap([]);
    const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
    fs.writeFileSync(outputPath, fallback, 'utf8');
    console.log('ℹ️  Fallback sitemap written.');
});