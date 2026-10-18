import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    originalPrice: {
      type: Number,
      default: 0
    },
    category: {
      type: String,
      required: true,
      index: true
    },
    image: {
      type: String,
      required: true
    },
    images: [{
      type: String
    }],
    rating: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 124
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockCount: {
      type: Number,
      default: 50
    },
    featured: {
      type: Boolean,
      default: false
    },
    badge: {
      type: String,
      default: ''
    },
    specs: {
      type: Map,
      of: String,
      default: {}
    }
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
