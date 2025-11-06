import mongoose from 'mongoose';

export const connectDB = async (): Promise<boolean> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    // If no MongoDB URI is provided, skip database connection
    if (!mongoURI) {
      console.log('⚠️  No MONGODB_URI provided - running without database');
      console.log('💡 To enable database features, set MONGODB_URI environment variable');
      return false;
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📡 Database: ${mongoose.connection.name}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('📴 MongoDB disconnected');
    });
    
    process.on('SIGINT', async () => {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed through app termination');
      }
      process.exit(0);
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    console.log('⚠️  Server will continue without database connection');
    return false;
  }
};