import mongoose from 'mongoose';

// Use environment variable or fallback to local MongoDB instance for development
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose to the global type
declare global {
  var mongooseCache: ConnectionCache;
}

// Initialize global connection cache
if (!global.mongooseCache) {
  global.mongooseCache = {
    conn: null,
    promise: null
  };
}

async function dbConnect() {
  // If we have a connection already, return it
  if (global.mongooseCache.conn) {
    return global.mongooseCache.conn;
  }

  // If a connection is being established, wait for it
  if (!global.mongooseCache.promise) {
    console.log('Connecting to MongoDB...');
    
    const opts = {
      bufferCommands: false,
    };

    // Create new promise
    if (MONGODB_URI) {
      global.mongooseCache.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        throw error;
      });
    }
  }
  
  // Wait for the connection
  try {
    global.mongooseCache.conn = await global.mongooseCache.promise;
    return global.mongooseCache.conn;
  } catch (error) {
    console.error('Failed to resolve MongoDB connection:', error);
    throw error;
  }
}

export default dbConnect; 