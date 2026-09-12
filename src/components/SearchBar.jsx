import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ variant = 'icon' }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        navigate(`/search?q=${encodeURIComponent(q)}`);
        setQuery('');
        setOpen(false);
    };

    /* ছোট 🔍 আইকন (হেডারে) */
    if (variant === 'icon') {
        return (
            <>
                <button
                    type="button"
                    className="search-icon-btn"
                    onClick={() => setOpen(!open)}
                    aria-label="সার্চ"
                >
                    🔍
                </button>

                {open && (
                    <div className="search-overlay" onClick={() => setOpen(false)}>
                        <form
                            className="search-form"
                            onSubmit={handleSubmit}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="প্রোডাক্ট খুঁজুন..."
                                autoFocus
                            />
                            <button type="submit" className="search-submit">
                                🔍
                            </button>
                            <button
                                type="button"
                                className="search-close"
                                onClick={() => setOpen(false)}
                            >
                                ✕
                            </button>
                        </form>
                    </div>
                )}
            </>
        );
    }

    /* বড় inline সার্চ বার */
    return (
        <form className="search-bar-inline" onSubmit={handleSubmit}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="প্রোডাক্ট খুঁজুন..."
            />
            <button type="submit">🔍</button>
        </form>
    );
}