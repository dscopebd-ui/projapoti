import { Link } from 'react-router-dom';
import { categories } from '../data/categories.js';

export default function CategoryGrid() {
    return (
        <div className="categories-section" id="categories">
            <h2 className="section-title">ক্যাটাগরি</h2>
            <div className="category-grid">
                {categories.map((c) => (
                    <Link
                        key={c.id}
                        to={`/category/${c.slug}`}
                        className="category-card"
                        title={`${c.label} — সব পণ্য দেখুন`}
                    >
                        <span className="category-icon">{c.icon}</span>
                        <strong>{c.label}</strong>
                    </Link>
                ))}
            </div>
        </div>
    );
}