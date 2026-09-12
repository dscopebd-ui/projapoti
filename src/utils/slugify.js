/**
 * বাংলা/ইংরেজি নাম থেকে URL-friendly slug বানায়
 */
export function slugify(text) {
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