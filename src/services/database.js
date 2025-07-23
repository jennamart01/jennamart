import { MongoClient } from 'mongodb';

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const options = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority',
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(process.env.MONGODB_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(process.env.MONGODB_URI, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database service class for FreePos operations
export class DatabaseService {
  constructor() {
    this.dbName = process.env.MONGODB_DB || 'freepos';
  }

  async getDatabase() {
    try {
      const client = await clientPromise;
      return client.db(this.dbName);
    } catch (error) {
      console.error('Database connection error:', error);
      if (error.message.includes('SSL') || error.message.includes('TLS')) {
        console.error('SSL/TLS connection failed. Check MongoDB Atlas SSL settings.');
      }
      throw error;
    }
  }

  // Products collection operations
  async getProducts(filter = {}) {
    try {
      const db = await this.getDatabase();
      const products = await db.collection('products').find(filter).toArray();
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async addProduct(product) {
    try {
      const db = await this.getDatabase();
      const result = await db.collection('products').insertOne({
        ...product,
        createdAt: new Date(),
      });
      return result;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  async updateProduct(id, product) {
    try {
      const db = await this.getDatabase();
      const result = await db.collection('products').updateOne(
        { _id: id },
        { $set: { ...product, updatedAt: new Date() } }
      );
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const db = await this.getDatabase();
      const result = await db.collection('products').deleteOne({ _id: id });
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Orders collection operations
  async getOrders(filter = {}) {
    try {
      const db = await this.getDatabase();
      const orders = await db.collection('orders').find(filter).toArray();
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  async addOrder(order) {
    try {
      const db = await this.getDatabase();
      const orderNumber = `ORD-${Date.now()}`;
      const result = await db.collection('orders').insertOne({
        ...order,
        orderNumber,
        createdAt: new Date(),
        status: 'completed',
      });
      return result;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  async updateOrder(id, order) {
    try {
      const db = await this.getDatabase();
      const result = await db.collection('orders').updateOne(
        { _id: id },
        { $set: { ...order, updatedAt: new Date() } }
      );
      return result;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  // Test connection
  async testConnection() {
    try {
      const db = await this.getDatabase();
      await db.admin().ping();
      console.log('MongoDB connection successful');
      return true;
    } catch (error) {
      console.error('MongoDB connection failed:', error);
      return false;
    }
  }
}