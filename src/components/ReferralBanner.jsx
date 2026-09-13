import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    getReferralFromUrl,
    saveReferralToStorage,
    findAffiliateByCode
} from '../firebase/affiliates.js';

export default function ReferralBanner() {
    const [searchParams] = useSearchParams();
    const [referrer, setReferrer] = useState(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const ref = searchParams.get('ref');
        if (!ref) return;

        const code = ref.trim().toUpperCase();

        /* LocalStorage-এ সেভ */
        saveReferralToStorage(code);

        /* ইউজারের নাম খুঁজে বের করি */
        findAffiliateByCode(code).then((user) => {
            if (user) {
                setReferrer({ code: user.referralCode, name: user.name });
            } else {
                setReferrer({ code, name: null });
            }
            setVisible(true);
        });
    }, [searchParams]);

    if (!visible || !referrer) return null;

    return (
        <div className="referral-banner">
            <div className="referral-banner-content">
                <span className="referral-banner-icon">🎁</span>
                <div>
                    <div className="referral-banner-title">
                        {referrer.name
                            ? `${referrer.name} এর থেকে এসেছেন?`
                            : 'রেফারেলে এসেছেন!'}
                    </div>
                    <div className="referral-banner-sub">
                        অর্ডারে বিশেষ ছাড় পাবেন
                    </div>
                </div>
                <button
                    type="button"
                    className="referral-banner-close"
                    onClick={() => setVisible(false)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
}