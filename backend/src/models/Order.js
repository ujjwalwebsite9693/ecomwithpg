import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      pincode: { type: String, required: true }
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'DELIVERED'],
      default: 'PENDING',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'COD'],
      default: 'UPI'
    },
    // YOUPI PG Gateway fields populated via Authoritative Webhook
    youpiPaymentId: {
      type: String,
      default: null
    },
    utr: {
      type: String,
      default: null,
      index: true
    },
    amountPaidPaise: {
      type: Number,
      default: null
    },
    paidAt: {
      type: Date,
      default: null
    },
    webhookVerified: {
      type: Boolean,
      default: false
    },
    webhookDeliveryId: {
      type: String,
      default: null
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
