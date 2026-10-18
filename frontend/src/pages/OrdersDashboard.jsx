import React, { useState, useEffect } from 'react';
import { fetchAllOrders } from '../services/api.js';

export function OrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => {
    setLoading(true);
    fetchAllOrders()
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Merchant Orders Ledger</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Authoritative order states verified via YOUPI PG V2 Bank Observers &amp; Signed Webhooks.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          🔄 Refresh Orders
        </button>
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        {loading && orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading orders ledger...
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
            No orders placed yet. Place your first test payment via the store!
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Items</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Bank UTR</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '1rem', fontWeight: '700', color: '#818cf8', fontFamily: 'monospace' }}>
                    {order.orderId}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '600', color: '#ffffff' }}>{order.customer?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{order.customer?.phone}</div>
                  </td>

                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {order.items?.length || 1} items
                  </td>

                  <td style={{ padding: '1rem', fontWeight: '700', color: '#ffffff' }}>
                    ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                  </td>

                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${order.status === 'PAID' ? 'badge-success' : 'badge-primary'}`}>
                      {order.status === 'PAID' ? '✓ PAID' : 'PENDING'}
                    </span>
                  </td>

                  <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.8rem', color: order.utr ? '#34d399' : 'var(--text-dim)' }}>
                    {order.utr || '—'}
                  </td>

                  <td style={{ padding: '1rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default OrdersDashboard;
