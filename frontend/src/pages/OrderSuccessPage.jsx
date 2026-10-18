import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

export function OrderSuccessPage({ order, onContinueShopping }) {
  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  }, []);

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{ maxWidth: '680px', margin: '3rem auto', padding: '0 1.5rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2.5rem', textAlign: 'center', position: 'relative' }}>
        
        {/* Success Icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '2px solid #10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.35)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>

        <span className="badge badge-success" style={{ marginBottom: '1rem' }}>
          ✓ PAYMENT AUTHORITATIVELY CONFIRMED
        </span>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#ffffff' }}>
          Thank You For Your Order!
        </h1>

        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your payment was verified in real-time via YOUPI PG V2 Bank Observers. Your package is being packed for priority dispatch.
        </p>

        {/* Receipt Details Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          textAlign: 'left',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Order ID</div>
              <div style={{ color: '#818cf8', fontWeight: '700', fontSize: '1rem' }}>{order.orderId}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Amount Paid</div>
              <div style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem' }}>₹{Number(order.totalAmount || order.amountPaid || 0).toLocaleString('en-IN')}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Payment Mode</div>
              <div style={{ color: '#38bdf8', fontWeight: '600' }}>{order.paymentMethod || 'UPI (Zero-Fee)'}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Bank UTR / Ref</div>
              <div style={{ color: '#34d399', fontWeight: '700', fontFamily: 'monospace' }}>{order.utr || 'VERIFIED_BY_OBSERVER'}</div>
            </div>

            <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border)', paddingTop: '0.85rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Estimated Delivery</div>
              <div style={{ color: '#f8fafc', fontWeight: '600' }}>🚚 Arriving by {formattedDelivery} (Express Priority)</div>
            </div>

            {order.customer && (
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Deliver To</div>
                <div style={{ color: 'var(--text-muted)' }}>
                  <strong>{order.customer.name}</strong> ({order.customer.phone})<br />
                  {order.customer.address}, {order.customer.city} - {order.customer.pincode}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
          >
            🖨️ Print Receipt
          </button>

          <button
            onClick={onContinueShopping}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
          >
            Continue Shopping ➔
          </button>
        </div>

      </div>
    </div>
  );
}

export default OrderSuccessPage;
