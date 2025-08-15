import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    const database = await db.getDatabase();
    
    // Build date filter
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }
    
    // Get orders for the period
    const orders = await database.collection('orders')
      .find(dateFilter, { projection: { total: 1, items: 1, createdAt: 1 } })
      .toArray();
    
    // Calculate basic stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get unique products sold
    const allItems = orders.flatMap(order => order.items || []);
    const uniqueProducts = [...new Set(allItems.map(item => item.productId || item.name))];
    const uniqueProductsSold = uniqueProducts.length;
    
    // Find best selling product
    const productSales = {};
    allItems.forEach(item => {
      const key = item.productId || item.name;
      if (!productSales[key]) {
        productSales[key] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[key].quantity += item.quantity || 0;
      productSales[key].revenue += (item.price || 0) * (item.quantity || 0);
    });
    
    const bestSellingProduct = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)[0] || null;
    
    const highestRevenueProduct = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)[0] || null;
    
    const averageItemsPerOrder = totalOrders > 0 ? totalItemsSold / totalOrders : 0;
    
    // Calculate growth (compare with previous period if possible)
    let revenueGrowth = null;
    let ordersGrowth = null;
    
    if (fromDate && toDate) {
      const periodDuration = new Date(toDate) - new Date(fromDate);
      const previousFromDate = new Date(new Date(fromDate) - periodDuration);
      const previousToDate = new Date(fromDate);
      
      const previousOrders = await database.collection('orders')
        .find({
          createdAt: {
            $gte: previousFromDate,
            $lt: previousToDate
          }
        }, { projection: { total: 1 } })
        .toArray();
      
      const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const previousOrderCount = previousOrders.length;
      
      if (previousRevenue > 0) {
        revenueGrowth = ((totalRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
      }
      
      if (previousOrderCount > 0) {
        ordersGrowth = ((totalOrders - previousOrderCount) / previousOrderCount * 100).toFixed(1);
      }
    }
    
    const stats = {
      totalRevenue,
      totalOrders,
      totalItemsSold,
      averageOrderValue,
      uniqueProductsSold,
      bestSellingProduct,
      highestRevenueProduct,
      averageItemsPerOrder,
      revenueGrowth: revenueGrowth ? parseFloat(revenueGrowth) : null,
      ordersGrowth: ordersGrowth ? parseFloat(ordersGrowth) : null,
      period: {
        fromDate,
        toDate,
        totalDays: fromDate && toDate ? 
          Math.ceil((new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24)) + 1 : null
      }
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Error fetching sales stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch sales statistics',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
