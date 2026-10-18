import express from 'express';
import { Product } from '../models/Product.js';
import { INITIAL_PRODUCTS } from '../seed/seedProducts.js';

export const productsRouter = express.Router();

// GET /api/products - Get all products with optional filters
productsRouter.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }
    if (featured === 'true') {
      query.featured = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let products = [];
    try {
      products = await Product.find(query).sort({ createdAt: -1 });
      if (products.length === 0 && !search && (!category || category === 'All')) {
        // Fallback to initial products if database collection is empty
        products = INITIAL_PRODUCTS;
      }
    } catch {
      // If MongoDB is offline, gracefully return in-memory initial catalog
      products = INITIAL_PRODUCTS.filter(p => {
        if (category && category !== 'All' && p.category !== category) return false;
        if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
    }

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/products/:id - Get single product details
productsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    try {
      product = await Product.findById(id);
    } catch {
      product = INITIAL_PRODUCTS.find(p => p._id === id || p.name.toLowerCase().replace(/\s+/g, '-') === id);
    }

    if (!product) {
      // Also search initial products by index or name
      const fallback = INITIAL_PRODUCTS.find((p, idx) => String(idx) === id || p.name.toLowerCase().includes(id.toLowerCase()));
      if (fallback) return res.json({ success: true, data: fallback });
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default productsRouter;
