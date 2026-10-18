import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export function ProductCard({ product, onQuickBuy }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      {/* Image Container */}
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {product.badge && (
          <span
            className="badge badge-primary"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backdropFilter: 'blur(8px)',
              background: 'rgba(79, 70, 229, 0.85)',
              color: '#ffffff'
            }}
          >
            {product.badge}
          </span>
        )}

        {discountPercent > 0 && (
          <span
            className="badge badge-success"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backdropFilter: 'blur(8px)'
            }}
          >
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          {product.category}
        </div>

        <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.3' }}>
          {product.name}
        </h3>

        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.description}
        </p>

        {/* Ratings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem', fontSize: '0.82rem' }}>
          <span style={{ color: '#fbbf24' }}>★</span>
          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{product.rating}</span>
          <span style={{ color: 'var(--text-dim)' }}>({product.reviewsCount} reviews)</span>
        </div>

        {/* Price & Action */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice > product.price && (
            <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            onClick={handleAdd}
            className="btn-secondary"
            style={{
              padding: '0.55rem',
              fontSize: '0.85rem',
              background: added ? 'rgba(16, 185, 129, 0.2)' : undefined,
              borderColor: added ? '#10b981' : undefined,
              color: added ? '#34d399' : undefined
            }}
          >
            {added ? '✓ Added' : 'Add to Cart'}
          </button>

          <button
            onClick={() => onQuickBuy(product)}
            className="btn-primary"
            style={{ padding: '0.55rem', fontSize: '0.85rem' }}
          >
            Buy Now ⚡
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
