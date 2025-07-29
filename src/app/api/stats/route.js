import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const database = await db.getDatabase();
    
    // Get collection counts
    const productsCount = await database.collection('products').countDocuments();
    const ordersCount = await database.collection('orders').countDocuments();
    
    // Get total revenue
    const orders = await database.collection('orders').find({}, { projection: { total: 1 } }).toArray();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    // Get latest order date
    const latestOrder = await database.collection('orders')
      .findOne({}, { sort: { createdAt: -1 }, projection: { createdAt: 1 } });
    
    // Get latest product date
    const latestProduct = await database.collection('products')
      .findOne({}, { sort: { createdAt: -1 }, projection: { createdAt: 1 } });
    
    const stats = {
      collections: {
        products: {
          count: productsCount,
          lastUpdated: latestProduct?.createdAt || null
        },
        orders: {
          count: ordersCount,
          lastUpdated: latestOrder?.createdAt || null,
          totalRevenue: totalRevenue
        }
      },
      summary: {
        totalProducts: productsCount,
        totalOrders: ordersCount,
        totalRevenue: totalRevenue,
        lastActivity: latestOrder?.createdAt || latestProduct?.createdAt || null
      }
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
