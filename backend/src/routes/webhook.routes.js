import crypto from 'node:crypto';
import express from 'express';
import { Order } from '../models/Order.js';
import { memoryOrders } from './orders.routes.js';

export const webhookRouter = express.Router();

/**
 * AUTHORITATIVE YOUPI PAYMENT GATEWAY WEBHOOK
 * 
 * Invariants from AGENTS.md:
 * 1. Request bytes must NOT be parsed to JSON before HMAC calculation.
 * 2. Signature header format: 'sha256=<64_hex_hash>'
 * 3. Timing-safe equality check prevents timing side-channel attacks.
 * 4. Fulfill orders ONLY on verified server-to-server webhook.
 */
webhookRouter.post(
  '/',
  // Use raw body buffer specifically for the webhook endpoint
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const signature = req.headers['x-gateway-signature'] || '';
      const deliveryId = req.headers['x-gateway-delivery-id'] || '';
      const secret = process.env.YOUPI_WEBHOOK_SECRET || 'youpi_webhook_secret_default_key_32c';

      if (!req.body || req.body.length === 0) {
        return res.status(400).json({ error: 'Missing webhook request body' });
      }

      // Compute expected HMAC-SHA256 signature directly over raw unparsed bytes
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(req.body);
      const expected = 'sha256=' + hmac.digest('hex');

      // Timing-safe constant-time string comparison
      if (
        signature.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'))
      ) {
        console.error('[YOUPI Webhook Error]: Signature mismatch!');
        console.error(`Received: ${signature}`);
        console.error(`Expected: ${expected}`);
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }

      // Parse payload after HMAC verification is confirmed
      const payload = JSON.parse(req.body.toString('utf8'));
      console.log(`[YOUPI Webhook Verified]: Event=${payload.event}, OrderId=${payload.orderId}, UTR=${payload.utr}, Amount=₹${payload.amount}`);

      if (payload.event === 'SUCCESS') {
        const updateData = {
          status: 'PAID',
          paymentMethod: payload.method || 'UPI',
          youpiPaymentId: payload.paymentId,
          utr: payload.utr || null,
          amountPaidPaise: payload.amountPaise || (Number(payload.amount) * 100),
          paidAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
          webhookVerified: true,
          webhookDeliveryId: deliveryId
        };

        // 1. Update in MongoDB
        try {
          const updated = await Order.findOneAndUpdate(
            { orderId: payload.orderId },
            { $set: updateData },
            { new: true }
          );

          if (updated) {
            console.log(`[MongoDB Updated]: Order ${payload.orderId} authoritatively marked as PAID.`);
          }
        } catch (dbErr) {
          console.warn('[MongoDB Webhook Warning]:', dbErr.message);
        }

        // 2. Update in fallback memory cache
        if (memoryOrders.has(payload.orderId)) {
          const existing = memoryOrders.get(payload.orderId);
          memoryOrders.set(payload.orderId, {
            ...existing,
            ...updateData
          });
        }
      }

      // Always return HTTP 200 to acknowledge webhook receipt
      return res.status(200).json({
        received: true,
        orderId: payload.orderId,
        event: payload.event,
        deliveryId
      });
    } catch (err) {
      console.error('[YOUPI Webhook Internal Error]:', err);
      return res.status(500).json({ error: 'Webhook processing error', details: err.message });
    }
  }
);

export default webhookRouter;
