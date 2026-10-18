import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../services/api.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Accessories', 'Home Entertainment'];

export function HomePage({ onNavigateCheckout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchProducts({ category: activeCategory, search: searchQuery })
      .then(data => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load products', err);
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [activeCategory, searchQuery]);

  const handleQuickBuy = (product) => {
    addToCart(product, 1);
    onNavigateCheckout();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Hero Banner */}
      <div className="glass-panel" style={{
        padding: '3rem 2.5rem',
        marginBottom: '2.5rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)'
      }}>
        {/* Glow Sphere */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.4)', borderRadius: '2rem', marginBottom: '1.25rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#818cf8', letterSpacing: '0.04em' }}>
              DIRECT YOUPI PG V2 INTEGRATION
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: '800', lineHeight: '1.15', marginBottom: '1rem', color: '#ffffff' }}>
            Next-Gen Tech Devices.<br />
            <span style={{ background: 'linear-gradient(90deg, #818cf8 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Instant Zero-Fee UPI.
            </span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.75rem', lineHeight: '1.6' }}>
            Experience frictionless UPI payments via GPay, PhonePe, Paytm &amp; CRED with sovereign bank-level automated observation and zero gateway surcharges.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#10b981' }}>✓</span> 100% Zero Payment Surcharge
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#10b981' }}>✓</span> Instant Bank SMS Verification
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#10b981' }}>✓</span> Free Priority Shipping
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '2rem' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search audio, watches, accessories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem', fontSize: '0.88rem' }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
            🔍
          </span>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <div className="animate-spin" style={{ width: '36px', height: '36px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p>Loading premium catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📦</div>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No products found matching your filter.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.75rem'
        }}>
          {products.map(product => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onQuickBuy={handleQuickBuy}
            />
          ))}
        </div>
      )}

    </div>
  );
}

export default HomePage;
