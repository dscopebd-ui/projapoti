export function formatPrice(amount) {
    return '৳ ' + Number(amount || 0).toLocaleString('en-BD');
}

export function getDiscountPercent(price, oldPrice) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round((1 - price / oldPrice) * 100);
}