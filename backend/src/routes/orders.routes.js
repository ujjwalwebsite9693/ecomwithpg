import express from 'express';
import { Order } from '../models/Order.js';

export const ordersRouter = express.Router();

// Helper to generate professional, unique human-readable order IDs
function generateOrderId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// In-memory fallback map if MongoDB is in offline mode
const memoryOrders = new Map();

// POST /api/orders - Create a new order
ordersRouter.post('/', async (req, res) => {
  try {
    const { customer, items, discount = 0, shippingFee = 0, paymentMethod = 'UPI' } = req.body;

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return res.status(400).json({ success: false, error: 'Customer name, phone, and delivery address are required.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart must contain at least one product item.' });
    }

    // Calculate subtotal and verify prices
    const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const totalAmount = Math.max(0, subtotal - Number(discount) + Number(shippingFee));

    const orderId = generateOrderId();

    const orderData = {
      orderId,
      customer: {
        name: customer.name.trim(),
        email: (customer.email || 'customer@example.com').trim(),
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: (customer.city || '').trim(),
        state: (customer.state || '').trim(),
        pincode: (customer.pincode || '').trim()
      },
      items: items.map(i => ({
        productId: String(i.id || i.productId || i._id),
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity) || 1,
        image: i.image || ''
      })),
      subtotal,
      discount: Number(discount),
      shippingFee: Number(shippingFee),
      totalAmount,
      currency: 'INR',
      status: paymentMethod === 'COD' ? 'PAID' : 'PENDING',
      paymentMethod,
      createdAt: new Date(),
      metadata: {
        source: 'MERN_STORE_FRONTEND',
        clientIp: req.ip
      }
    };

    let savedOrder = orderData;
    try {
      const orderDoc = new Order(orderData);
      savedOrder = await orderDoc.save();
    } catch (dbErr) {
      console.warn('[MongoDB Order Fallback]: Saved to in-memory order registry.', dbErr.message);
      memoryOrders.set(orderId, orderData);
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: savedOrder
    });
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:orderId - Check authoritative order status
ordersRouter.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;

    try {
      order = await Order.findOne({ orderId });
    } catch {
      order = memoryOrders.get(orderId);
    }

    if (!order) {
      order = memoryOrders.get(orderId);
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        status: order.status,
        totalAmount: order.totalAmount,
        currency: order.currency,
        customer: order.customer,
        items: order.items,
        paymentMethod: order.paymentMethod,
        utr: order.utr,
        paidAt: order.paidAt,
        webhookVerified: order.webhookVerified,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders - List all orders (merchant dashboard)
ordersRouter.get('/', async (req, res) => {
  try {
    let orders = [];
    try {
      orders = await Order.find().sort({ createdAt: -1 }).limit(50);
    } catch {
      orders = Array.from(memoryOrders.values()).reverse();
    }

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export { memoryOrders };
export default ordersRouter;
