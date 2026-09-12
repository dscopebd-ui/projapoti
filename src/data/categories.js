export const categories = [
    {
        id: 'গ্যাজেট',
        slug: 'gadget',
        icon: '📱',
        label: 'গ্যাজেট',
        description: 'স্মার্ট ওয়াচ, হেডফোন, স্পিকার ও অন্যান্য গ্যাজেট'
    },
    {
        id: 'ফ্যাশন',
        slug: 'fashion',
        icon: '👕',
        label: 'ফ্যাশন',
        description: 'শার্ট, প্যান্ট, জুতা, ব্যাগ ও অন্যান্য ফ্যাশন আইটেম'
    },
    {
        id: 'বিউটি',
        slug: 'beauty',
        icon: '💇‍♀️',
        label: 'বিউটি',
        description: 'স্কিন কেয়ার, মেকআপ ও হেয়ার কেয়ার পণ্য'
    },
    {
        id: 'ফুড সাপ্লিমেন্ট',
        slug: 'food-supplement',
        icon: '💊',
        label: 'ফুড সাপ্লিমেন্ট',
        description: 'ভিটামিন, প্রোটিন ও অন্যান্য ফুড সাপ্লিমেন্ট'
    }
];

export function getCategoryBySlug(slug) {
    return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id) {
    return categories.find((c) => c.id === id);
}