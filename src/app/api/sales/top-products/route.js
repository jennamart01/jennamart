import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = parseInt(searchParams.get('limit')) || 10;
    
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
      .find(dateFilter, { projection: { items: 1 } })
      .toArray();
    
    // Aggregate product sales
    const productSales = {};
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const key = item.productId || item.name;
          if (!productSales[key]) {
            productSales[key] = {
              name: item.name,
              price: item.price || 0,
              quantitySold: 0,
              totalRevenue: 0,
              orderCount: 0,
              orderIds: new Set()
            };
          }
          
          productSales[key].quantitySold += item.quantity || 0;
          productSales[key].totalRevenue += (item.price || 0) * (item.quantity || 0);
          
          // Track unique orders for this product
          if (order._id) {
            productSales[key].orderIds.add(order._id.toString());
          }
        });
      }
    });
    
    // Convert to array and sort by quantity sold
    const topProducts = Object.values(productSales)
      .map(product => ({
        name: product.name,
        price: product.price,
        quantitySold: product.quantitySold,
        totalRevenue: product.totalRevenue,
        orderCount: product.orderIds.size, // Unique orders count
        averageQuantityPerOrder: product.orderIds.size > 0 ? 
          (product.quantitySold / product.orderIds.size).toFixed(1) : '0.0'
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit)
      .map((product, index) => ({
        ...product,
        rank: index + 1
      }));
    
    return NextResponse.json(topProducts);
    
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch top products',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
