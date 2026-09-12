export default function MobileNav({ open, onClose }) {
    const links = [
        { href: '#home', label: 'হোম' },
        { href: '#categories', label: 'ক্যাটাগরি' },
        { href: '#products', label: 'পণ্যসমূহ' },
        { href: '#contact', label: 'যোগাযোগ' }
    ];

    return (
        <div className={`mobile-nav ${open ? 'open' : ''}`}>
            {links.map((l) => (
                <a key={l.href} href={l.href} onClick={onClose}>
                    {l.label}
                </a>
            ))}
        </div>
    );
}