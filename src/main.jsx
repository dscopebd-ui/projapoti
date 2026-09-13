import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/main.css';
import './styles/admin.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductProvider } from './context/ProductContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { AffiliateProvider } from './context/AffiliateContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <ProductProvider>
                    <CartProvider>
                        <AffiliateProvider>
                            <App />
                        </AffiliateProvider>
                    </CartProvider>
                </ProductProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);