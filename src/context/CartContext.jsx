import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'projapoti-cart';

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (id, qty = 1) => {
        setCart((prev) => ({
            ...prev,
            [id]: (prev[id] || 0) + qty
        }));
    };

    const incQty = (id) => addToCart(id, 1);

    const decQty = (id) => {
        setCart((prev) => {
            const next = { ...prev };
            if (!next[id]) return next;
            next[id] -= 1;
            if (next[id] <= 0) delete next[id];
            return next;
        });
    };

    const removeItem = (id) => {
        setCart((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    };

    const clearCart = () => setCart({});

    const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                totalQty,
                addToCart,
                incQty,
                decQty,
                removeItem,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be inside CartProvider');
    return ctx;
}