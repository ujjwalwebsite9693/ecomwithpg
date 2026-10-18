import React from 'react';
import { useCart } from '../context/CartContext.jsx';

export function CartDrawer({ onProceedToCheckout }) {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(6px)'
    }}>
      {/* Backdrop Click */}
      <div 
        style={{ flex: 1 }} 
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <div style={{
        width: '100%',
        maxWidth: '440px',
        height: '100%',
        background: '#0d131f',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h2 style={{ fontSize: '1.15rem' }}>Your Cart</h2>
            <span className="badge badge-primary">{cartCount} items</span>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            style={{ color: 'var(--text-muted)', fontSize: '1.25rem', padding: '0.25rem' }}
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Your shopping cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem'
                }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '0.5rem', background: '#0f172a' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#818cf8', margin: '0.2rem 0' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        style={{ width: '24px', height: '24px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px', color: '#fff', fontSize: '0.9rem' }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ marginLeft: 'auto', color: '#ef4444', fontSize: '0.75rem', background: 'none' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer & Checkout */}
        {cartItems.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(10, 14, 23, 0.95)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <span>Express Delivery</span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
              <span>Total</span>
              <span style={{ color: '#818cf8' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem' }}
            >
              Checkout Now ⚡
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default CartDrawer;
