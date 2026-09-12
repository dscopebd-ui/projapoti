import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/main.css';
import './styles/admin.css';                 {/* 🆕 এই লাইনটা যোগ করুন */}
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductProvider } from './context/ProductContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <ProductProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </ProductProvider>
        </AuthProvider>
    </React.StrictMode>
);