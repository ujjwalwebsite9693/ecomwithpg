export const INITIAL_PRODUCTS = [
  {
    name: "Aura Pro Wireless ANC Headphones",
    description: "Flagship active noise cancellation, custom 40mm titanium drivers, 65-hour battery life, and spatial audio with dynamic head tracking.",
    price: 4999,
    originalPrice: 8999,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviewsCount: 342,
    inStock: true,
    stockCount: 45,
    featured: true,
    badge: "Bestseller - 44% OFF",
    specs: {
      "Battery": "65 Hours (ANC Off) / 45 Hours (ANC On)",
      "Connectivity": "Bluetooth 5.3 + 3.5mm Aux",
      "Weight": "250g",
      "Warranty": "1 Year Replacement"
    }
  },
  {
    name: "Apex Ultra Smartwatch (OLED Titanium)",
    description: "Rugged Grade 5 Titanium casing, 1.96-inch Sapphire AMOLED 1000-nit display, ECG sensor, GPS dual-band, and 14-day endurance battery.",
    price: 6499,
    originalPrice: 11999,
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviewsCount: 218,
    inStock: true,
    stockCount: 28,
    featured: true,
    badge: "Trending",
    specs: {
      "Display": "1.96 inch Ultra AMOLED",
      "Water Resistance": "5ATM + IP68",
      "Battery": "Up to 14 days",
      "Sensors": "Heart Rate, SpO2, Sleep, ECG"
    }
  },
  {
    name: "Keyflow 75% Wireless Mechanical Keyboard",
    description: "Gasket-mounted hot-swappable tactile switches, frosted PBT dye-sub keycaps, RGB backlighting with per-key custom profiles, Bluetooth & 2.4GHz dongle.",
    price: 3899,
    originalPrice: 5999,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.9,
    reviewsCount: 156,
    inStock: true,
    stockCount: 60,
    featured: true,
    badge: "Popular",
    specs: {
      "Switches": "Pre-lubed Gateron Yellow Pro",
      "Layout": "75% Compact (82 Keys)",
      "Battery": "4000mAh Rechargable",
      "Plate": "Polycarbonate Gasket Mounted"
    }
  },
  {
    name: "NovaBeam 4K HDR Home Cinema Projector",
    description: "Native 4K UHD laser projection, 2200 ANSI Lumens brightness, Dolby Atmos dual Harman Kardon speakers, Android TV 11 with Netflix built-in.",
    price: 24999,
    originalPrice: 34999,
    category: "Home Entertainment",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.7,
    reviewsCount: 89,
    inStock: true,
    stockCount: 12,
    featured: false,
    badge: "Cinema Experience",
    specs: {
      "Resolution": "3840 x 2160 (4K)",
      "Brightness": "2200 ANSI Lumens",
      "Throw Ratio": "1.2:1 (Up to 150 inches)",
      "Audio": "Dual 10W Harman Kardon"
    }
  },
  {
    name: "Pulse Pods 3 True Wireless Earbuds",
    description: "Ultra-low latency 35ms gaming mode, hybrid active noise cancellation, transparency mode, wireless Qi charging case with 36 hours total playtime.",
    price: 2499,
    originalPrice: 4499,
    category: "Audio",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.6,
    reviewsCount: 420,
    inStock: true,
    stockCount: 85,
    featured: false,
    badge: "Budget King",
    specs: {
      "ANC": "Up to 38dB depth",
      "Playtime": "8 hours single charge, 36 hours with case",
      "Protection": "IPX5 Splashproof",
      "Driver": "11mm Dynamic Bass Boost"
    }
  },
  {
    name: "Vortex Magnetic Fast Wireless Charging Dock",
    description: "3-in-1 Foldable MagSafe compatible charging station for iPhone, Apple Watch, and AirPods. 15W Qi2 certified fast wireless output.",
    price: 1999,
    originalPrice: 3299,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80"
    ],
    rating: 4.8,
    reviewsCount: 194,
    inStock: true,
    stockCount: 70,
    featured: false,
    badge: "3-in-1 Station",
    specs: {
      "Output": "Phone: 15W, Watch: 5W, Buds: 5W",
      "Material": "Anodized Aluminum + Silicone",
      "Input": "Type-C (20W PD included)",
      "Safety": "Over-voltage & thermal protection"
    }
  }
];

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Product } from '../models/Product.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export async function seedProducts() {
  await connectDB();
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Seed] Seeding initial product catalog...');
      await Product.insertMany(INITIAL_PRODUCTS);
      console.log(`[Seed] Successfully seeded ${INITIAL_PRODUCTS.length} products.`);
    } else {
      console.log(`[Seed] Database already contains ${count} products. Skipping.`);
    }
  } catch (err) {
    console.warn('[Seed Warning]:', err.message);
  }
}

// Run standalone if invoked directly
if (process.argv[1] && process.argv[1].endsWith('seedProducts.js')) {
  seedProducts().then(() => {
    mongoose.connection.close();
    process.exit(0);
  });
}
