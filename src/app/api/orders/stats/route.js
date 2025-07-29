import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    const database = await db.getDatabase();
    
    // Calculate safety date (7 days ago from today)
    const today = new Date();
    const safetyDate = new Date(today);
    safetyDate.setDate(today.getDate() - 7);
    safetyDate.setHours(0, 0, 0, 0);
    
    // Build date filter
    let dateFilter = {};
    if (fromDate || toDate) {
      const dateRange = {};
      
      if (fromDate) {
        const fromDateTime = new Date(fromDate);
        fromDateTime.setHours(0, 0, 0, 0);
        dateRange.$gte = fromDateTime;
      }
      
      if (toDate) {
        const toDateTime = new Date(toDate);
        toDateTime.setHours(23, 59, 59, 999);
        dateRange.$lte = toDateTime;
      }
      
      dateFilter.createdAt = dateRange;
    }
    
    // Get orders in date range
    const ordersInRange = await database.collection('orders')
      .find(dateFilter, { projection: { total: 1, createdAt: 1 } })
      .toArray();
    
    // Get orders in safety period (last 7 days)
    const ordersInSafetyPeriod = await database.collection('orders')
      .find({ createdAt: { $gte: safetyDate } }, { projection: { total: 1, createdAt: 1 } })
      .toArray();
    
    // Get deletable orders (older than safety period and in range if specified)
    let deletableFilter = { createdAt: { $lt: safetyDate } };
    if (fromDate || toDate) {
      // Combine safety filter with date range
      const combinedFilter = { $and: [deletableFilter] };
      if (dateFilter.createdAt) {
        combinedFilter.$and.push(dateFilter);
      }
      deletableFilter = combinedFilter;
    }
    
    const deletableOrders = await database.collection('orders')
      .find(deletableFilter, { projection: { total: 1, createdAt: 1 } })
      .toArray();
    
    // Calculate statistics
    const stats = {
      dateRange: {
        from: fromDate,
        to: toDate,
        ordersInRange: ordersInRange.length,
        revenueInRange: ordersInRange.reduce((sum, order) => sum + (order.total || 0), 0)
      },
      safetyPeriod: {
        safetyDate: safetyDate.toISOString().split('T')[0],
        ordersInSafetyPeriod: ordersInSafetyPeriod.length,
        revenueInSafetyPeriod: ordersInSafetyPeriod.reduce((sum, order) => sum + (order.total || 0), 0)
      },
      deletable: {
        count: deletableOrders.length,
        revenue: deletableOrders.reduce((sum, order) => sum + (order.total || 0), 0),
        oldestOrder: deletableOrders.length > 0 
          ? deletableOrders.reduce((oldest, order) => 
              order.createdAt < oldest.createdAt ? order : oldest
            ).createdAt
          : null,
        newestOrder: deletableOrders.length > 0
          ? deletableOrders.reduce((newest, order) => 
              order.createdAt > newest.createdAt ? order : newest
            ).createdAt
          : null
      }
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch order statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
