import { categories } from '../data/categories.js';

export default function CategoryGrid({ activeCat, onSelect }) {
    const all = [
        { id: 'সব', icon: '✨', label: 'সব পণ্য' },
        ...categories
    ];

    return (
        <div className="categories-section" id="categories">
            <h2 className="section-title">ক্যাটাগরি</h2>
            <div className="category-grid">
                {all.map((c) => (
                    <a
                        key={c.id}
                        href="#products"
                        className={`category-card ${c.id === activeCat ? 'active' : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onSelect(c.id);
                        }}
                    >
                        <span className="category-icon">{c.icon}</span>
                        <strong>{c.label}</strong>
                    </a>
                ))}
            </div>
        </div>
    );
}