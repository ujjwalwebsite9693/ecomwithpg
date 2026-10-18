# 🛒 NOVA Electro — All-in-One Sovereign MERN Store & Integrated UPI Gateway

A complete, self-contained, production-ready MERN e-commerce store with an **integrated sovereign UPI payment gateway engine**. 

> ⚡ **NO SEPARATE LOCALHOST GATEWAY SERVER NEEDED**: The payment gateway logic (dynamic single-use QR generation, mobile UPI deep-links, Android SMS observation, and bank UTR verification) is **built directly into this website codebase itself**.

---

## 🌟 How the Integrated System Works

```
  [ Vercel Frontend (React + Vite) ]
                │
                ├─ 1. Customer chooses product & clicks "Pay via UPI"
                ├─ 2. Built-in Native Payment Modal opens directly on the website
                │     (Displays dynamic single-use QR + 1-Tap links for GPay, PhonePe, Paytm, CRED, BHIM)
                ▼
  [ Customer Pays from Any UPI App ]
                │
                ▼
  [ Your Bank sends credit SMS to your Phone ]
                │
                ▼
  [ YOUPI Bank Observer App on your phone ]
                │ (Forwards SMS in real-time to your Render Backend)
                ▼
  [ Render Backend (/api/gateway/events) ]
                │
                ├─ 1. Intelligent Indian Bank SMS Parser extracts Amount & UTR
                ├─ 2. Matches pending order in MongoDB
                ├─ 3. Authoritatively updates order status to "PAID"
                ▼
  [ Vercel Frontend detects "PAID" ]
                │
                ▼
  🎉 Confetti Celebration, Order Success Screen & Official Bank UTR Receipt!
```

---

## 🚀 Live Production Deployment (Render + Vercel + MongoDB Atlas)

### 1. Database Setup: MongoDB Atlas (Free Tier)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render can connect.
3. In **Database Access**, create a user (e.g. `youpi_admin` + secure password).
4. Copy your MongoDB connection string:
   ```
   mongodb+srv://youpi_admin:<password>@cluster0.xxxx.mongodb.net/youpi_ecommerce?retryWrites=true&w=majority
   ```

---

### 2. Backend Setup: Render
1. Push this folder (`apps/mern-ecommerce`) to your **GitHub** repository.
2. Go to [dashboard.render.com](https://dashboard.render.com/) ➔ **New Web Service**.
3. Select your repository.
4. Configure service:
   - **Name**: `youpi-mern-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables** in Render:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render internal port |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `MERCHANT_UPI_VPA` | `yourname@okhdfcbank` | Your personal/business UPI ID where customer money goes |
   | `MERCHANT_NAME` | `NOVA Electro` | Store name shown in customer's UPI app |
   | `FRONTEND_URL` | `https://your-store.vercel.app` | Your Vercel frontend URL |
6. Click **Deploy**. Your backend is now live at: `https://youpi-mern-backend.onrender.com`.

---

### 3. Frontend Setup: Vercel
1. Go to [vercel.com](https://vercel.com/) ➔ **Add New Project**.
2. Select your GitHub repository.
3. Configure project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`.
4. Add **Environment Variables** in Vercel:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE` | `https://youpi-mern-backend.onrender.com` (Your live Render backend URL) |
5. Click **Deploy**. Your website is live on Vercel!

---

### 4. Link Your Bank Observer Phone
1. Open your live website on Vercel.
2. Click **"⚡ Gateway Setup"** in the top navigation bar.
3. Verify or enter your **Receiving UPI ID** (e.g. `yourname@okhdfcbank` or `yourphone@paytm`).
4. Click **"📲 Download Observer APK"** to download the companion app onto your phone.
5. Open the app, grant SMS permissions, and scan the **Pairing QR Code** on your screen.
6. Your phone is now paired directly to your live Render backend! Whenever a customer pays via UPI, your phone detects the bank SMS, notifies the Render backend, and the order is instantly confirmed!

---

## 💻 Local Testing Guide

### Terminal 1: Backend
```powershell
cd apps/mern-ecommerce/backend
npm run dev
```

### Terminal 2: Frontend
```powershell
cd apps/mern-ecommerce/frontend
npm run dev
```
Open `http://localhost:5173` in your browser.
