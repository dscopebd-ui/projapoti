import { useState } from 'react';
import { categories } from '../data/categories.js';
import { addProduct } from '../firebase/products.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminProductForm({ onUploaded }) {
    const { user } = useAuth();

    const [name, setName] = useState('');
    const [cat, setCat] = useState('');
    const [price, setPrice] = useState('');
    const [oldPrice, setOldPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [benefitsRaw, setBenefitsRaw] = useState('');
    const [files, setFiles] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileChange = (e) => {
        const list = Array.from(e.target.files || []);
        if (list.length > 3) {
            alert('সর্বোচ্চ ৩টি ছবি নেওয়া যাবে');
        }
        setFiles(list.slice(0, 3));
    };

    const resetForm = () => {
        setName('');
        setCat('');
        setPrice('');
        setOldPrice('');
        setDesc('');
        setBenefitsRaw('');
        setFiles([]);
        const el = document.getElementById('adminProductImage');
        if (el) el.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!user) {
            setError('আগে লগইন করুন');
            return;
        }
        if (!name.trim() || !cat || !price || !desc.trim()) {
            setError('প্রয়োজনীয় ঘরগুলো পূরণ করুন');
            return;
        }
        if (files.length === 0) {
            setError('অন্তত ১টি ছবি নির্বাচন করুন');
            return;
        }

        setUploading(true);
        setProgress(5);

        try {
            /* ছবি Cloudinary-তে আপলোড */
            const imageUrls = [];
            for (let i = 0; i < files.length; i++) {
                setProgress(10 + (i / files.length) * 60);
                const url = await uploadToCloudinary(files[i]);
                imageUrls.push(url);
            }
            setProgress(80);

            /* benefits array */
            const benefits = benefitsRaw
                ? benefitsRaw
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [];

            /* Firestore-এ সেভ */
            await addProduct(
                {
                    id: Date.now(),
                    name: name.trim(),
                    cat,
                    price: Number(price) || 0,
                    oldPrice: Number(oldPrice) || 0,
                    img: imageUrls[0],
                    images: imageUrls,
                    desc: desc.trim(),
                    benefits,
                    specs: {}
                },
                user.uid
            );

            setProgress(100);
            setSuccess('✅ প্রোডাক্ট সফলভাবে যোগ করা হয়েছে!');
            resetForm();
            if (onUploaded) onUploaded();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            console.error(err);
            setError('❌ ' + (err.message || 'আপলোড ব্যর্থ হয়েছে'));
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 800);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            {error && <div className="admin-error-msg show">{error}</div>}
            {success && <div className="admin-success-msg show">{success}</div>}

            <div className="admin-field">
                <label>
                    প্রোডাক্টের নাম <span className="req">*</span>
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="যেমন: Smart Watch T900"
                    required
                />
                <div className="hint">
                    💡 ইংরেজিতে নাম দিলে URL সুন্দর হবে
                </div>
            </div>

            <div className="admin-row">
                <div className="admin-field">
                    <label>
                        ক্যাটাগরি <span className="req">*</span>
                    </label>
                    <select
                        value={cat}
                        onChange={(e) => setCat(e.target.value)}
                        required
                    >
                        <option value="">নির্বাচন করুন</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.icon} {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="admin-field">
                    <label>
                        দাম (৳) <span className="req">*</span>
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="1200"
                        required
                    />
                </div>
            </div>

            <div className="admin-field">
                <label>পুরনো দাম (৳) — অপশনাল</label>
                <input
                    type="number"
                    min="0"
                    step="1"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(e.target.value)}
                    placeholder="1600"
                />
                <div className="hint">
                    পুরনো দাম দিলে স্বয়ংক্রিয়ভাবে ডিসকাউন্ট % দেখাবে
                </div>
            </div>

            <div className="admin-field">
                <label>
                    বিবরণ <span className="req">*</span>
                </label>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="প্রোডাক্টের বিবরণ লিখুন..."
                    required
                />
            </div>

            <div className="admin-field">
                <label>সুবিধা — অপশনাল</label>
                <textarea
                    value={benefitsRaw}
                    onChange={(e) => setBenefitsRaw(e.target.value)}
                    placeholder="কমা দিয়ে আলাদা করুন। যেমন: আরামদায়ক, টেকসই, স্টাইলিশ"
                />
                <div className="hint">
                    প্রতিটি সুবিধা কমা (,) দিয়ে আলাদা করুন
                </div>
            </div>

            <div className="admin-field" style={{ marginTop: 16 }}>
                <label>
                    ছবি (১-৩টি) <span className="req">*</span>
                </label>
                <input
                    id="adminProductImage"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    required
                />
                <div className="hint">
                    {files.length
                        ? files.map((f) => f.name).join(', ')
                        : '১-৩টি ছবি নির্বাচন করুন (Cloudinary-তে অটো WebP হবে)'}
                </div>
            </div>

            {progress > 0 && (
                <div className="admin-progress show">
                    <span style={{ width: progress + '%' }}></span>
                </div>
            )}

            <button
                type="submit"
                className="admin-submit"
                disabled={uploading}
            >
                {uploading ? '⏳ আপলোড হচ্ছে...' : '⬆️ প্রোডাক্ট আপলোড করুন'}
            </button>
        </form>
    );
}