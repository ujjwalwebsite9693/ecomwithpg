import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function GatewaySettingsPage() {
  const [config, setConfig] = useState({
    merchantVpa: 'pay.nova.electro@okhdfcbank',
    merchantName: 'NOVA Electro'
  });
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);

  const loadGatewayData = () => {
    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/api/gateway/config`).then(r => r.json()),
      fetch(`${API_BASE}/api/gateway/pair-qr`).then(r => r.json())
    ])
      .then(([configRes, pairRes]) => {
        if (configRes.success) {
          setConfig({
            merchantVpa: configRes.config.merchantVpa,
            merchantName: configRes.config.merchantName
          });
        }
        if (pairRes.success) {
          setPairData(pairRes);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load gateway settings', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadGatewayData();
    const interval = setInterval(loadGatewayData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving...');
    try {
      const res = await fetch(`${API_BASE}/api/gateway/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus('✓ Gateway Settings Updated!');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('Error saving: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: '#ffffff' }}>
          ⚡ Integrated YOUPI Payment Gateway Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Configure your receiving UPI ID and pair your Android handset to automate real-time bank SMS verification.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Card: Receiving UPI ID */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💳 Receiving UPI Account</span>
          </h2>

          <form onSubmit={handleSaveConfig}>
            <div className="form-group">
              <label className="form-label">Store / Merchant Display Name</label>
              <input
                type="text"
                value={config.merchantName}
                onChange={(e) => setConfig({ ...config, merchantName: e.target.value })}
                placeholder="e.g. NOVA Electro Store"
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                Displayed inside customer's GPay, PhonePe, and Paytm app.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Receiving UPI VPA (UPI ID) *</label>
              <input
                type="text"
                value={config.merchantVpa}
                onChange={(e) => setConfig({ ...config, merchantVpa: e.target.value })}
                placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                className="form-input"
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem', display: 'block' }}>
                Customer payment goes directly into this bank account without middleman fees.
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            >
              Save Payment Settings 💾
            </button>

            {saveStatus && (
              <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.85rem', color: '#34d399', fontWeight: '600' }}>
                {saveStatus}
              </div>
            )}
          </form>

          {/* Quick Notice */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: '1.5' }}>
            🔒 <strong>Zero Fees Architecture</strong>: Customer scans QR ➔ Bank transfers money directly to your UPI ID ➔ Phone observer reads credit SMS ➔ Order is fulfilled automatically.
          </div>
        </div>

        {/* Right Card: Android Phone Pairing */}
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#ffffff' }}>
            📱 Pair Bank Observer Phone
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Scan with the <strong>YOUPI Bank Observer</strong> app on your bank-registered smartphone.
          </p>

          {/* QR Box */}
          {loading || !pairData ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '220px',
                  height: '220px',
                  margin: '0 auto',
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                }}
                dangerouslySetInnerHTML={{ __html: pairData.pairingQrSvg }}
              />

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                Secret: <code style={{ color: '#38bdf8', fontWeight: '700' }}>{pairData.enrollmentToken}</code>
              </div>
            </div>
          )}

          {/* Connected Devices */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border)',
            borderRadius: '0.65rem',
            padding: '0.75rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.35rem' }}>
              Connected Mobile Observers ({pairData?.devices?.length || 0})
            </div>

            {pairData?.devices && pairData.devices.length > 0 ? (
              pairData.devices.map(dev => (
                <div key={dev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#34d399', marginRight: '0.4rem' }}>●</span>
                    <strong style={{ color: '#f8fafc' }}>{dev.deviceName}</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No phone paired yet. Install app &amp; scan the QR.
              </div>
            )}
          </div>

          {/* Download APK Button */}
          <a
            href={`${API_BASE}/api/gateway/download-apk`}
            download="youpi-sms-gateway.apk"
            className="btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
          >
            📲 Download Observer APK
          </a>

        </div>

      </div>

    </div>
  );
}

export default GatewaySettingsPage;
