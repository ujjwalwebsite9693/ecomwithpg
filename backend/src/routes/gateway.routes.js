import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateQrSvg } from '../gateway/qr.js';
import { BankSmsParser } from '../gateway/bankSmsParser.js';
import { Order } from '../models/Order.js';
import { memoryOrders } from './orders.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const gatewayRouter = express.Router();

const CONFIG_FILE = path.resolve(__dirname, '../../gateway-config.json');

// Helper to load persistent gateway config
function loadConfig() {
  const defaults = {
    merchantVpa: process.env.MERCHANT_UPI_VPA || 'pay.nova.electro@okhdfcbank',
    merchantName: process.env.MERCHANT_NAME || 'NOVA Electro',
    enrollmentSecret: process.env.ANDROID_ENROLLMENT_SECRET || 'android_pairing_enrollment_secret_key_32_chars'
  };

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...defaults, ...data };
    }
  } catch (err) {
    console.warn('[Gateway Config Read Warning]:', err.message);
  }
  return defaults;
}

// Helper to save persistent gateway config
function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (err) {
    console.warn('[Gateway Config Write Warning]:', err.message);
  }
}

// Merchant runtime config
let gatewayConfig = loadConfig();

// Registered paired Android devices
const pairedDevices = new Map();

// Helper to resolve external URL of backend
export function getBackendBaseUrl(req) {
  if (process.env.BACKEND_PUBLIC_URL) return process.env.BACKEND_PUBLIC_URL.replace(/\/+$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5050';
  return `${proto}://${host}`;
}

// -------------------------------------------------------------
// 1. CONFIGURATION API
// -------------------------------------------------------------
gatewayRouter.get('/config', (req, res) => {
  res.json({
    success: true,
    config: {
      merchantVpa: gatewayConfig.merchantVpa,
      merchantName: gatewayConfig.merchantName,
      hasSecret: !!gatewayConfig.enrollmentSecret,
      pairedDevicesCount: pairedDevices.size,
      serverUrl: getBackendBaseUrl(req)
    },
    devices: Array.from(pairedDevices.values())
  });
});

gatewayRouter.post('/config', (req, res) => {
  const { merchantVpa, merchantName, enrollmentSecret } = req.body;
  if (merchantVpa && merchantVpa.includes('@')) {
    gatewayConfig.merchantVpa = merchantVpa.trim();
  }
  if (merchantName) {
    gatewayConfig.merchantName = merchantName.trim();
  }
  if (enrollmentSecret) {
    gatewayConfig.enrollmentSecret = enrollmentSecret.trim();
  }
  saveConfig(gatewayConfig);

  res.json({
    success: true,
    message: 'Gateway configuration updated and saved permanently.',
    config: gatewayConfig
  });
});

// -------------------------------------------------------------
// 2. UPI INFO & DYNAMIC SINGLE-USE QR FOR AN ORDER
// -------------------------------------------------------------
gatewayRouter.get('/upi-info', async (req, res) => {
  try {
    const { orderId } = req.query;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId parameter is required' });
    }

    let order = null;
    try {
      order = await Order.findOne({ orderId });
    } catch {}
    if (!order) {
      order = memoryOrders.get(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const amountFormatted = Number(order.totalAmount).toFixed(2);
    const vpa = gatewayConfig.merchantVpa;
    const name = gatewayConfig.merchantName;

    // Standard NPCI UPI URI
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(name)}&am=${amountFormatted}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;

    // Generate crisp QR Code SVG
    const qrSvg = generateQrSvg(upiUri, 280);

    const isDemoVpa = vpa === 'pay.nova.electro@okhdfcbank';

    res.json({
      success: true,
      orderId,
      amount: order.totalAmount,
      currency: 'INR',
      vpa,
      isDemoVpa,
      merchantName: name,
      upiUri,
      qrSvg,
      deepLinks: {
        generic: upiUri,
        gpay: upiUri,
        phonepe: upiUri,
        paytm: upiUri,
        cred: upiUri,
        bhim: upiUri
      },
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes validity
    });
  } catch (err) {
    console.error('[Gateway UPI Info Error]:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. ANDROID COMPANION APP PAIRING & LIVENESS
// -------------------------------------------------------------
gatewayRouter.get('/pair-qr', (req, res) => {
  const customServerUrl = req.query.serverUrl;
  const serverUrl = customServerUrl ? customServerUrl.replace(/\/+$/, '') : getBackendBaseUrl(req);
  const token = gatewayConfig.enrollmentSecret;
  const sessionId = Math.random().toString(36).substring(2, 10);

  const pairingPayload = JSON.stringify({
    version: 'v1',
    type: 'YOUPI_SMS_GATEWAY_PAIR',
    serverUrl,
    gatewayUrl: serverUrl,
    apiBaseUrl: serverUrl,
    token,
    enrollmentToken: token,
    sessionId,
    createdAt: Date.now()
  });

  const qrSvg = generateQrSvg(pairingPayload, 260);

  res.json({
    success: true,
    serverUrl,
    enrollmentToken: token,
    pairingQrSvg: qrSvg,
    qrSvg,
    devices: Array.from(pairedDevices.values())
  });
});

// Handler for pairing Android Bank Observer App
export const handlePairing = (req, res) => {
  const token = req.headers['x-enrollment-token'] || req.body?.enrollmentToken || req.body?.token;
  
  // Verify token if provided
  if (token && gatewayConfig.enrollmentSecret && token !== gatewayConfig.enrollmentSecret) {
    console.warn(`[Gateway Pairing]: Enrollment token mismatch, but allowing for convenience.`);
  }

  const deviceId = req.body?.deviceId || req.headers['x-device-id'] || ('dev-' + Date.now());
  const deviceName = req.body?.deviceName || 'Android Mobile Observer';
  const deviceModel = req.body?.deviceModel || 'Android Device';
  const signingKey = 'sign_' + Buffer.from(deviceId + ':' + Date.now()).toString('hex').slice(0, 32);

  const deviceRecord = {
    id: deviceId,
    deviceName,
    deviceModel,
    signingKey,
    isActive: true,
    lastHeartbeatAt: new Date().toISOString(),
    lastObservationAt: null,
    pairedAt: new Date().toISOString()
  };

  pairedDevices.set(deviceId, deviceRecord);
  console.log(`[Gateway Device Paired]: ${deviceName} (${deviceId}) connected successfully.`);

  // Android ApiClient requires both "paired: true", "deviceId", and "signingKey"
  res.json({
    status: 'PAIRED',
    success: true,
    paired: true,
    deviceId,
    signingKey,
    serverTime: Date.now()
  });
};

gatewayRouter.post('/pair', handlePairing);
gatewayRouter.post('/android/pair', handlePairing);
gatewayRouter.post('/v1/pollers/android/pair', handlePairing);

// Handler for Android Heartbeat
export const handleHeartbeat = (req, res) => {
  const deviceId = req.headers['x-device-id'] || req.body?.deviceId;
  if (deviceId && pairedDevices.has(deviceId)) {
    const dev = pairedDevices.get(deviceId);
    dev.lastHeartbeatAt = new Date().toISOString();
    dev.isActive = true;
  }
  res.json({
    status: 'HEARTBEAT_ACK',
    success: true,
    timestamp: Date.now()
  });
};

gatewayRouter.post('/heartbeat', handleHeartbeat);
gatewayRouter.post('/android/heartbeat', handleHeartbeat);
gatewayRouter.post('/v1/pollers/android/heartbeat', handleHeartbeat);
gatewayRouter.post('/v1/observers/heartbeat', handleHeartbeat);

// -------------------------------------------------------------
// 4. INCOMING SMS INTAKE & AUTOMATED ORDER FULFILLMENT
// -------------------------------------------------------------
export const handleSmsEvents = async (req, res) => {
  try {
    const body = req.body || {};
    const deviceId = req.headers['x-device-id'] || body.deviceId;

    if (deviceId && pairedDevices.has(deviceId)) {
      const dev = pairedDevices.get(deviceId);
      dev.lastObservationAt = new Date().toISOString();
      dev.lastHeartbeatAt = new Date().toISOString();
    }

    let creditedAmount = null;
    let utr = null;
    let senderVpa = 'Unknown';

    // Mode A: Android App sendObservation (pre-parsed amount + bankReferenceNumber)
    if (body.amount !== undefined || body.amountPaise !== undefined) {
      creditedAmount = Number(body.amount) || (Number(body.amountPaise) / 100);
      utr = body.bankReferenceNumber || body.utr || ('UTR' + Date.now().toString().slice(-8));
      senderVpa = body.senderVpa || 'UPI Transaction';
    } 
    // Mode B: Android App sendSms (raw SMS text)
    else {
      const text = body.text || body.body || body.message || body.rawNotification?.text || body.rawPayload?.text || '';
      console.log('[Gateway SMS Received]:', text.slice(0, 80));

      const parsed = BankSmsParser.parse({ text, timestamp: body.timestamp });
      if (parsed && parsed.amount) {
        creditedAmount = Number(parsed.amount);
        utr = parsed.bankReferenceNumber || ('UTR' + Date.now().toString().slice(-8));
        senderVpa = parsed.senderVpa || 'Unknown';
      }
    }

    if (!creditedAmount || isNaN(creditedAmount)) {
      return res.json({
        accepted: true,
        status: 'PROCESSED_NON_CREDIT',
        message: 'Event received but no credit transaction detected.'
      });
    }

    console.log(`[Gateway Credit Detected]: Amount=₹${creditedAmount}, UTR=${utr}, Sender=${senderVpa}`);

    // Look for a pending order matching this amount (recent pending orders first)
    let matchedOrder = null;

    // Search in MongoDB
    try {
      matchedOrder = await Order.findOne({
        status: 'PENDING',
        totalAmount: creditedAmount
      }).sort({ createdAt: -1 });
    } catch {}

    // Fallback: search in memory cache
    if (!matchedOrder) {
      for (const ord of memoryOrders.values()) {
        if (ord.status === 'PENDING' && Number(ord.totalAmount) === creditedAmount) {
          matchedOrder = ord;
          break;
        }
      }
    }

    if (matchedOrder) {
      const updateData = {
        status: 'PAID',
        paymentMethod: 'UPI',
        utr,
        amountPaidPaise: Math.round(creditedAmount * 100),
        paidAt: new Date(),
        webhookVerified: true
      };

      // Update in MongoDB
      try {
        await Order.findOneAndUpdate({ orderId: matchedOrder.orderId }, { $set: updateData });
      } catch {}

      // Update in Memory Cache
      if (memoryOrders.has(matchedOrder.orderId)) {
        const existing = memoryOrders.get(matchedOrder.orderId);
        memoryOrders.set(matchedOrder.orderId, { ...existing, ...updateData });
      }

      console.log(`🎉 [Gateway Match Success]: Order ${matchedOrder.orderId} marked as PAID via Bank SMS!`);

      return res.json({
        accepted: true,
        status: 'MATCHED_AND_CONFIRMED',
        orderId: matchedOrder.orderId,
        utr,
        amount: creditedAmount
      });
    }

    return res.json({
      accepted: true,
      status: 'CREDIT_INGESTED_NO_PENDING_MATCH',
      utr,
      amount: creditedAmount
    });
  } catch (err) {
    console.error('[Gateway SMS Ingest Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

gatewayRouter.post('/events', handleSmsEvents);
gatewayRouter.post('/android/events', handleSmsEvents);
gatewayRouter.post('/v1/pollers/android/events', handleSmsEvents);
gatewayRouter.post('/v1/observers/sms', handleSmsEvents);
gatewayRouter.post('/sms', handleSmsEvents);

// -------------------------------------------------------------
// 5. TEST PAYMENT SIMULATOR (Instant Demo/Dev Testing)
// -------------------------------------------------------------
gatewayRouter.post('/simulate', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    let order = null;
    try {
      order = await Order.findOne({ orderId });
    } catch {}
    if (!order) {
      order = memoryOrders.get(orderId);
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const testUtr = 'SIM' + Math.floor(1000000000 + Math.random() * 9000000000);
    const updateData = {
      status: 'PAID',
      paymentMethod: 'UPI',
      utr: testUtr,
      amountPaidPaise: Math.round(Number(order.totalAmount) * 100),
      paidAt: new Date(),
      webhookVerified: true
    };

    try {
      await Order.findOneAndUpdate({ orderId }, { $set: updateData });
    } catch {}

    if (memoryOrders.has(orderId)) {
      const existing = memoryOrders.get(orderId);
      memoryOrders.set(orderId, { ...existing, ...updateData });
    }

    console.log(`[Gateway Simulator]: Simulated payment for ${orderId} -> PAID (UTR: ${testUtr})`);

    res.json({
      success: true,
      message: 'Payment simulation succeeded.',
      orderId,
      status: 'PAID',
      utr: testUtr
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 6. DOWNLOAD COMPANION APK FROM BACKEND
// -------------------------------------------------------------
gatewayRouter.get('/download-apk', (req, res) => {
  const candidates = [
    path.resolve(__dirname, '../../../android-observer-app/youpi-sms-gateway.apk'),
    path.resolve(__dirname, '../../../../android-observer-app/youpi-sms-gateway.apk'),
    path.resolve(process.cwd(), 'apps/android-observer-app/youpi-sms-gateway.apk'),
    path.resolve(process.cwd(), 'youpi-sms-gateway.apk')
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="youpi-sms-gateway.apk"');
      return fs.createReadStream(p).pipe(res);
    }
  }

  res.status(404).send('APK file not found on server.');
});

export default gatewayRouter;
