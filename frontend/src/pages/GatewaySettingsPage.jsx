import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export function GatewaySettingsPage() {
  const [config, setConfig] = useState({
    merchantVpa: 'pay.nova.electro@okhdfcbank',
    merchantName: 'NOVA Electro',
    enrollmentSecret: 'android_pairing_enrollment_secret_key_32_chars'
  });
  const [serverUrl, setServerUrl] = useState('');
  const [pairData, setPairData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const loadGatewayData = (customUrl) => {
    setLoading(true);
    const targetUrl = customUrl !== undefined ? customUrl : serverUrl;
    const query = targetUrl ? `?serverUrl=${encodeURIComponent(targetUrl)}` : '';

    Promise.all([
      fetch(`${API_BASE}/api/gateway/config`).then(r => r.json()),
      fetch(`${API_BASE}/api/gateway/pair-qr${query}`).then(r => r.json())
    ])
      .then(([configRes, pairRes]) => {
        if (configRes.success) {
          setConfig(prev => ({
            ...prev,
            merchantVpa: configRes.config.merchantVpa,
            merchantName: configRes.config.merchantName,
            enrollmentSecret: configRes.config.enrollmentSecret || prev.enrollmentSecret
          }));
          if (!serverUrl && configRes.config.serverUrl) {
            setServerUrl(configRes.config.serverUrl);
          }
        }
        if (pairRes.success) {
          setPairData(pairRes);
          if (!serverUrl && pairRes.serverUrl) {
            setServerUrl(pairRes.serverUrl);
          }
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
    const interval = setInterval(() => loadGatewayData(), 6000);
    return () => clearInterval(interval);
  }, []);

  const handleUrlChange = (newUrl) => {
    setServerUrl(newUrl);
    loadGatewayData(newUrl);
  };

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
        setSaveStatus('✓ Gateway Settings Saved & Applied!');
        setTimeout(() => setSaveStatus(null), 3500);
      }
    } catch (err) {
      setSaveStatus('Error saving: ' + err.message);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isDemoVpa = config.merchantVpa === 'pay.nova.electro@okhdfcbank';

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem', color: '#ffffff' }}>
          ⚡ Integrated YOUPI Payment Gateway Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real UPI zero-fee payments with live Android bank SMS verification engine.
        </p>
      </div>

      {/* Demo VPA Warning */}
      {isDemoVpa && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <span style={{ fontSize: '1.75rem' }}>⚠️</span>
          <div>
            <strong style={{ color: '#f87171', display: 'block', marginBottom: '0.2rem' }}>
              Action Required: Demo UPI ID Active
            </strong>
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Your store is currently using the placeholder UPI ID (<code>pay.nova.electro@okhdfcbank</code>).
              UPI apps (GPay, PhonePe, Paytm) will decline payments until you enter your <strong>real UPI ID</strong> below!
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Receiving UPI Account Settings */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💳 Receiving Bank UPI Account</span>
          </h2>

          <form onSubmit={handleSaveConfig}>
            <div className="form-group">
              <label className="form-label">Receiving UPI ID (VPA) *</label>
              <input
                type="text"
                value={config.merchantVpa}
                onChange={(e) => setConfig({ ...config, merchantVpa: e.target.value })}
                placeholder="e.g. yourname@okaxis, 9876543210@paytm, name@ibl"
                className="form-input"
                style={{
                  borderColor: isDemoVpa ? '#ef4444' : 'var(--border)',
                  background: isDemoVpa ? 'rgba(239, 68, 68, 0.05)' : undefined
                }}
                required
              />
              <span style={{ fontSize: '0.78rem', color: isDemoVpa ? '#f87171' : '#38bdf8', marginTop: '0.3rem', display: 'block' }}>
                Customer payments will go directly to this bank account (0% gateway fees).
              </span>
            </div>

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
                Displayed inside customer's GPay, PhonePe, or Paytm app.
              </span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
            >
              Save Payment Settings 💾
            </button>

            {saveStatus && (
              <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.85rem', color: '#34d399', fontWeight: '600' }}>
                {saveStatus}
              </div>
            )}
          </form>

          {/* Architecture Explainer */}
          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-dim)', lineHeight: '1.6' }}>
            <strong style={{ color: '#f8fafc' }}>💡 How Real UPI Verification Works:</strong>
            <ol style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <li>Customer scans order QR or taps UPI app.</li>
              <li>Bank transfers amount directly to your UPI ID.</li>
              <li>Your bank sends an incoming credit SMS to your phone.</li>
              <li>The <strong>YOUPI Bank Observer</strong> app reads the SMS &amp; notifies the backend.</li>
              <li>Order status turns to <strong style={{ color: '#34d399' }}>PAID</strong> in &lt;1 second!</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Android Companion Phone Pairing */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', color: '#ffffff' }}>
            📱 Pair Bank Observer Phone
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Install the companion APK on the smartphone that receives bank credit SMS alerts.
          </p>

          {/* Configurable Server URL for Pairing */}
          <div className="form-group" style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>
              Backend URL (Phone connects to this address):
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="e.g. https://your-backend.onrender.com or http://192.168.1.5:5050"
                className="form-input"
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
              />
              <button
                type="button"
                onClick={() => loadGatewayData(serverUrl)}
                className="btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
              >
                Update QR
              </button>
            </div>
            {serverUrl && serverUrl.includes('localhost') && (
              <span style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.25rem', display: 'block' }}>
                ⚠️ Notice: If testing on a real phone, replace <code>localhost</code> with your computer's local WiFi IP (e.g. <code>http://192.168.x.x:5050</code>) or Render URL.
              </span>
            )}
          </div>

          {/* QR Box */}
          {loading || !pairData ? (
            <div style={{ height: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%' }} />
            </div>
          ) : (
            <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
              <div
                style={{
                  width: '230px',
                  height: '230px',
                  margin: '0 auto',
                  background: '#ffffff',
                  borderRadius: '0.75rem',
                  padding: '10px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                }}
                dangerouslySetInnerHTML={{ __html: pairData.pairingQrSvg }}
              />
            </div>
          )}

          {/* Manual Copy Credentials Box */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border)',
            borderRadius: '0.65rem',
            padding: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.5rem' }}>
              Manual App Configuration (If QR Scan Fails)
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Gateway URL:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <code style={{ color: '#38bdf8', fontSize: '0.75rem' }}>{pairData?.serverUrl || serverUrl}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pairData?.serverUrl || serverUrl, 'url')}
                  style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {copiedKey === 'url' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Secret Token:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <code style={{ color: '#38bdf8', fontSize: '0.75rem' }}>{pairData?.enrollmentToken || config.enrollmentSecret}</code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pairData?.enrollmentToken || config.enrollmentSecret, 'token')}
                  style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {copiedKey === 'token' ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Connected Observers Status */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border)',
            borderRadius: '0.65rem',
            padding: '0.75rem 0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.4rem' }}>
              Live Connected Handsets ({pairData?.devices?.length || 0})
            </div>

            {pairData?.devices && pairData.devices.length > 0 ? (
              pairData.devices.map(dev => (
                <div key={dev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#34d399', marginRight: '0.4rem' }}>●</span>
                    <strong style={{ color: '#f8fafc' }}>{dev.deviceName}</strong>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: '700' }}>
                    ONLINE
                  </span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No phone paired yet. Scan the QR code or enter credentials manually.
              </div>
            )}
          </div>

          {/* Download APK Link */}
          <div style={{ textAlign: 'center' }}>
            <a
              href={`${API_BASE}/api/gateway/download-apk`}
              download="youpi-sms-gateway.apk"
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.65rem 1.25rem' }}
            >
              📲 Download YOUPI Observer APK
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}

export default GatewaySettingsPage;
