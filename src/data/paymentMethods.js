export const paymentMethods = [
    { id: 'cod', label: 'ক্যাশ অন ডেলিভারি', number: '' },
    { id: 'bkash', label: 'বিকাশ', number: '01869296343 (Personal)' },
    { id: 'nagad', label: 'নগদ', number: '01869296343 (Personal)' },
    { id: 'rocket', label: 'রকেট', number: '01869296343 (Personal)' }
];

export function getDeliveryCharge(district) {
    if (!district) return 0;
    if (district === 'চট্টগ্রাম') return 70;
    return 120;
}