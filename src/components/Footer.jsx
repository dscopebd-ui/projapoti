import { Link } from 'react-router-dom';
import { SITE } from '../data/siteConfig.js';
import { categories } from '../data/categories.js';

export default function Footer() {
    return (
        <footer id="contact">
            <div className="footer-content">
                <div className="footer-column">
                    <h3>{SITE.name}</h3>
                    <p>{SITE.footerDesc}</p>
                    <p><em>"{SITE.tagline}"</em></p>
                </div>

                <div className="footer-column">
                    <h3>ক্যাটাগরি</h3>
                    <ul>
                        {categories.map((c) => (
                            <li key={c.id}>
                                <Link to={`/category/${c.slug}`}>
                                    {c.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="footer-column">
                    <h3>যোগাযোগের তথ্য</h3>
                    <ul>
                        <li>
                            📞 <strong>ফোন:</strong>{' '}
                            <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
                        </li>
                        <li>
                            ✉️ <strong>ইমেইল:</strong>{' '}
                            <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                        </li>
                        <li>
                            📌 <strong>ঠিকানা:</strong> {SITE.address}
                        </li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <p>{SITE.copyright}</p>
            </div>
        </footer>
    );
}