import React from 'react';
import { useCart } from '../context/CartContext.jsx';

export function Navbar({ activePage, setActivePage }) {
  const { cartCount, subtotal, setIsCartOpen } = useCart();

  return (
    <nav className="glass-nav">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActivePage('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99, 102, 241, 0.45)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>NOVA</span>
              <span style={{ color: '#06b6d4', fontWeight: '700' }}>ELECTRO</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: '600' }}>
              Zero-Fee UPI Store
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button
            onClick={() => setActivePage('home')}
            style={{
              color: activePage === 'home' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activePage === 'home' ? '700' : '500',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
              background: 'none'
            }}
          >
            Explore Store
          </button>

          <button
            onClick={() => setActivePage('orders')}
            style={{
              color: activePage === 'orders' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activePage === 'orders' ? '700' : '500',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
              background: 'none'
            }}
          >
            Merchant Ledger
          </button>

          <button
            onClick={() => setActivePage('gateway')}
            style={{
              color: activePage === 'gateway' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activePage === 'gateway' ? '700' : '500',
              fontSize: '0.9rem',
              transition: 'color 0.2s',
              background: 'none'
            }}
          >
            ⚡ Gateway Setup
          </button>
        </div>

        {/* Cart Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setIsCartOpen(true)}
            style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              borderRadius: '0.75rem',
              padding: '0.55rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>

            {cartCount > 0 && (
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '700',
                color: '#818cf8'
              }}>
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            )}

            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                background: '#4f46e5',
                color: '#ffffff',
                fontSize: '0.7rem',
                fontWeight: '800',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(79, 70, 229, 0.7)'
              }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;
