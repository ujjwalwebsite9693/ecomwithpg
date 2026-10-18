import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { productsRouter } from './routes/products.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';
import { gatewayRouter } from './routes/gateway.routes.js';
import { seedProducts } from './seed/seedProducts.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB & seed initial catalog
connectDB().then(() => {
  seedProducts();
});

// Configure CORS for Vercel Frontend & Localhost
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server) or from allowed origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, can restrict in strict prod
    }
  },
  credentials: true
}));

app.use(morgan('dev'));

// CRITICAL: Mount Webhook route BEFORE express.json() middleware!
// The webhook router uses express.raw({ type: 'application/json' }) to ensure
// raw bytes are preserved for cryptographic HMAC-SHA256 signature verification.
app.use('/api/webhook', webhookRouter);

// Standard JSON parser for all other REST API routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check endpoint for Render & Uptime Monitors
app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    service: 'youpi-mern-backend',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/gateway', gatewayRouter);
app.use('/api/v1/pollers', gatewayRouter);
app.use('/api/observers', gatewayRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 YOUPI MERN Backend listening on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`💳 Webhook URL:  http://localhost:${PORT}/api/webhook`);
  console.log(`====================================================`);
});

export default app;
