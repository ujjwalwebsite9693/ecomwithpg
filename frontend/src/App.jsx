import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.jsx';
import { OrdersDashboard } from './pages/OrdersDashboard.jsx';
import { GatewaySettingsPage } from './pages/GatewaySettingsPage.jsx';

export function App() {
  const [activePage, setActivePage] = useState('home');
  const [completedOrder, setCompletedOrder] = useState(null);

  // Global listener for YOUPI normalized browser events (AGENTS.md)
  useEffect(() => {
    const handlePaymentSuccess = (e) => {
      console.log('[YOUPI Event: youpi:payment:success]', e.detail);
    };

    window.addEventListener('youpi:payment:success', handlePaymentSuccess);
    return () => {
      window.removeEventListener('youpi:payment:success', handlePaymentSuccess);
    };
  }, []);

  const handleOrderSuccess = (order) => {
    setCompletedOrder(order);
    setActivePage('success');
  };

  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigation Bar */}
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Cart Drawer */}
        <CartDrawer
          onProceedToCheckout={() => setActivePage('checkout')}
        />

        {/* Dynamic Page Views */}
        <main style={{ flex: 1 }}>
          {activePage === 'home' && (
            <HomePage
              onNavigateCheckout={() => setActivePage('checkout')}
            />
          )}

          {activePage === 'checkout' && (
            <CheckoutPage
              onOrderSuccess={handleOrderSuccess}
              onBackToStore={() => setActivePage('home')}
            />
          )}

          {activePage === 'success' && completedOrder && (
            <OrderSuccessPage
              order={completedOrder}
              onContinueShopping={() => setActivePage('home')}
            />
          )}

          {activePage === 'orders' && (
            <OrdersDashboard />
          )}

          {activePage === 'gateway' && (
            <GatewaySettingsPage />
          )}
        </main>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)',
          background: 'rgba(10, 14, 23, 0.95)',
          padding: '2.5rem 1.5rem',
          marginTop: '4rem',
          textAlign: 'center',
          color: 'var(--text-dim)',
          fontSize: '0.85rem'
        }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
              <span>NOVA ELECTRO</span> • <span>POWERED BY YOUPI PG V2</span>
            </div>
            <p style={{ maxWidth: '600px', margin: '0 auto 1.25rem', color: 'var(--text-muted)' }}>
              A sovereign self-hosted MERN store architecture utilizing Zero-Fee UPI &amp; automated banking observation engines.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.78rem' }}>
              <span>✓ NPCI UPI Intent</span>
              <span>✓ HMAC-SHA256 Signed Webhooks</span>
              <span>✓ Render &amp; Vercel Ready</span>
            </div>
          </div>
        </footer>

      </div>
    </CartProvider>
  );
}

export default App;
