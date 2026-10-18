import React, { useState, useEffect } from 'react';
import { fetchOrderStatus } from '../services/api.js';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function PaymentModal({ order, onClose, onSuccess }) {
  const [upiData, setUpiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch dynamic single-use UPI info & QR code from integrated gateway
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${API_BASE}/api/gateway/upi-info?orderId=${order.orderId}`)
      .then(res => {
        if (!res.ok) throw new Error('Could not generate UPI QR');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setUpiData(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [order.orderId]);

  // 2. Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 3. Real-time Status Polling (checks if Android App detected bank SMS)
  useEffect(() => {
    const poller = setInterval(async () => {
      try {
        const status = await fetchOrderStatus(order.orderId);
        if (status && status.status === 'PAID') {
          clearInterval(poller);
          onSuccess(status);
        }
      } catch (e) {
        console.warn('Status poll warning:', e.message);
      }
    }, 1500);

    return () => clearInterval(poller);
  }, [order.orderId, onSuccess]);

  // 4. Test Payment Simulator
  const handleSimulate = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/gateway/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.orderId })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess({ ...order, status: 'PAID', utr: data.utr });
      }
    } catch (e) {
      alert('Simulation error: ' + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 200,
      background: 'rgba(5, 8, 15, 0.82)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#0d131f',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '1.25rem',
        padding: '2rem',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.2)',
        position: 'relative',
        animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            color: 'var(--text-muted)',
            fontSize: '1.25rem',
            background: 'none',
            padding: '0.25rem'
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', marginBottom: '0.75rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#818cf8', textTransform: 'uppercase' }}>
              Sovereign UPI Gateway
            </span>
          </div>

          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.25rem', color: '#ffffff' }}>
            Scan &amp; Pay via Any UPI App
          </h2>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Paying to: <strong style={{ color: '#f8fafc' }}>{upiData?.merchantName || 'NOVA Electro'}</strong>
          </div>
        </div>

        {/* Amount Display */}
        <div style={{
          textAlign: 'center',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Amount Due
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', color: '#38bdf8' }}>
            ₹{Number(order.totalAmount).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: timeLeft > 60 ? '#10b981' : '#ef4444', fontWeight: '700', marginTop: '0.25rem' }}>
            ⏱️ Expires in {timeFormatted}
          </div>
        </div>

        {/* QR Code Card */}
        {loading ? (
          <div style={{ height: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
            <span style={{ fontSize: '0.85rem' }}>Generating Dynamic Single-Use QR...</span>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444', fontSize: '0.9rem' }}>
            ⚠️ {error}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '240px',
                height: '240px',
                margin: '0 auto',
                background: '#ffffff',
                borderRadius: '0.85rem',
                padding: '10px',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.6)'
              }}
              dangerouslySetInnerHTML={{ __html: upiData.qrSvg }}
            />

            <div style={{ marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Scan using <strong>GPay, PhonePe, Paytm, CRED, BHIM</strong>
            </div>
          </div>
        )}

        {/* Mobile UPI Deep Links (Visible on mobile/tap) */}
        {upiData?.deepLinks && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', marginBottom: '0.5rem', fontWeight: '600' }}>
              OR PAY DIRECTLY VIA APP:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              <a
                href={upiData.deepLinks.gpay}
                className="btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center', borderRadius: '6px' }}
              >
                GPay
              </a>
              <a
                href={upiData.deepLinks.phonepe}
                className="btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center', borderRadius: '6px' }}
              >
                PhonePe
              </a>
              <a
                href={upiData.deepLinks.paytm}
                className="btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center', borderRadius: '6px' }}
              >
                Paytm
              </a>
              <a
                href={upiData.deepLinks.generic}
                className="btn-secondary"
                style={{ padding: '0.4rem', fontSize: '0.72rem', textAlign: 'center', borderRadius: '6px', color: '#818cf8', fontWeight: '700' }}
              >
                Any UPI
              </a>
            </div>
          </div>
        )}

        {/* Pulse Observing Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          padding: '0.6rem',
          borderRadius: '0.5rem',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border)',
          marginBottom: '1rem'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8', animation: 'pulseGlow 1.5s infinite' }} />
          <span>Awaiting bank SMS confirmation from phone...</span>
        </div>

        {/* Test Simulator Trigger */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              textDecoration: 'underline',
              background: 'none',
              cursor: 'pointer'
            }}
          >
            {isSimulating ? 'Simulating bank credit...' : '⚡ Test Mode: Simulate Instant Bank Credit'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default PaymentModal;
