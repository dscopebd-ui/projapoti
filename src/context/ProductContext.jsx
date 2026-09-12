import { createContext, useContext, useEffect, useState } from 'react';
import { listenProducts } from '../firebase/products.js';

const ProductContext = createContext(null);

export function ProductProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsub = listenProducts(
            (list) => {
                setProducts(list);
                setLoading(false);
                setError(null);
            },
            (err) => {
                setError(err.message || 'লোড ব্যর্থ');
                setLoading(false);
            }
        );
        return () => unsub();
    }, []);

    return (
        <ProductContext.Provider value={{ products, loading, error }}>
            {children}
        </ProductContext.Provider>
    );
}

export function useProducts() {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProducts must be inside ProductProvider');
    return ctx;
}