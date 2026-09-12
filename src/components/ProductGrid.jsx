import ProductCard from './ProductCard.jsx';
import { categories } from '../data/categories.js';

export default function ProductGrid({ products, activeCat, onOpenDetail, loading }) {
    if (loading) {
        return (
            <div className="product-grid">
                <div className="empty-msg">প্রোডাক্ট লোড হচ্ছে...</div>
            </div>
        );
    }

    if (activeCat === 'সব') {
        const sections = categories
            .map((c) => ({
                cat: c,
                list: products.filter((p) => p.cat === c.id)
            }))
            .filter((s) => s.list.length > 0);

        if (sections.length === 0) {
            return (
                <div className="product-grid">
                    <div className="empty-msg">
                        এখনো কোনো পণ্য যোগ করা হয়নি।
                    </div>
                </div>
            );
        }

        return (
            <div className="product-grid">
                {sections.map((s) => (
                    <div key={s.cat.id} style={{ display: 'contents' }}>
                        <div className="cat-divider">
                            {s.cat.icon} {s.cat.label}
                        </div>
                        {s.list.map((p) => (
                            <ProductCard
                                key={p.firebaseDocId || p.id}
                                product={p}
                                onOpenDetail={onOpenDetail}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    const list = products.filter((p) => p.cat === activeCat);

    if (list.length === 0) {
        return (
            <div className="product-grid">
                <div className="empty-msg">
                    এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।
                </div>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {list.map((p) => (
                <ProductCard
                    key={p.firebaseDocId || p.id}
                    product={p}
                    onOpenDetail={onOpenDetail}
                />
            ))}
        </div>
    );
}