import { MongoClient } from 'mongodb';

// Use environment variable or fallback to local MongoDB instance for development
const uri = process.env.MONGODB_URI;
const options = {};

if (!uri) {
  throw new Error('MONGODB_URI is not defined in the environment variables');
}

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents multiple connections when API routes are called.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    console.log('Creating new MongoDB client connection in development mode');
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((client) => {
        console.log('MongoDB client connected successfully');
        return client;
      })
      .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        throw err;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Creating new MongoDB client connection in production mode');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 