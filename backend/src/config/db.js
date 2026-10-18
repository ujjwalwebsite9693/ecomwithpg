import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/youpi_ecommerce';

  try {
    const isLocalDev = !process.env.MONGODB_URI;
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: isLocalDev ? 1500 : 8000,
      connectTimeoutMS: isLocalDev ? 2000 : 10000
    });

    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${conn.connection.name} @ ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Warning]: Could not connect to ${mongoUri}`);
    console.error(`[MongoDB Error Details]: ${error.message}`);
    console.log(`[MongoDB Tip]: For production (Render), set MONGODB_URI in your Render environment variables using MongoDB Atlas connection string (mongodb+srv://...).`);
  }
}

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[MongoDB] Disconnected from database.');
});

export default connectDB;
