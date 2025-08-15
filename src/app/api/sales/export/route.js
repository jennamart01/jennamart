import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const reportType = searchParams.get('type') || 'overview';
    
    const database = await db.getDatabase();
    
    // Build date filter
    let dateFilter = {};
    if (fromDate && toDate) {
      dateFilter.createdAt = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate)
      };
    }
    
    // Get comprehensive data
    const [orders, products] = await Promise.all([
      database.collection('orders').find(dateFilter).toArray(),
      database.collection('products').find({}).toArray()
    ]);
    
    // Calculate comprehensive statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalItemsSold = orders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0
    );
    
    // Product analysis
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
              orderCount: 0
            };
          }
          
          productSales[key].quantitySold += item.quantity || 0;
          productSales[key].totalRevenue += (item.price || 0) * (item.quantity || 0);
          productSales[key].orderCount += 1;
        });
      }
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 20);
    
    // Daily breakdown
    const dailyBreakdown = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          date,
          orders: 0,
          revenue: 0,
          items: 0
        };
      }
      dailyBreakdown[date].orders += 1;
      dailyBreakdown[date].revenue += order.total || 0;
      dailyBreakdown[date].items += order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
    });
    
    const dailySales = Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date));
    
    // Create comprehensive report
    const report = {
      metadata: {
        reportType,
        generatedAt: new Date().toISOString(),
        period: {
          fromDate: fromDate || 'All time',
          toDate: toDate || 'All time'
        },
        totalRecords: {
          orders: totalOrders,
          products: products.length
        }
      },
      summary: {
        totalRevenue,
        totalOrders,
        totalItemsSold,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        uniqueProductsSold: Object.keys(productSales).length,
        averageItemsPerOrder: totalOrders > 0 ? totalItemsSold / totalOrders : 0
      },
      topProducts: topProducts.map((product, index) => ({
        rank: index + 1,
        ...product,
        revenuePercentage: totalRevenue > 0 ? ((product.totalRevenue / totalRevenue) * 100).toFixed(2) : 0
      })),
      dailySales,
      detailedOrders: reportType === 'detailed' ? orders.map(order => ({
        orderNumber: order.orderNumber || `ORD-${order._id?.toString().slice(-6)}`,
        date: order.createdAt,
        customerName: order.customerName || 'Guest',
        total: order.total,
        itemCount: order.items?.length || 0,
        items: order.items?.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: (item.price || 0) * (item.quantity || 0)
        })) || []
      })) : undefined
    };
    
    // Generate filename
    const periodStr = fromDate && toDate ? 
      `${fromDate}_to_${toDate}` : 
      new Date().toISOString().split('T')[0];
    const filename = `sales-report-${reportType}-${periodStr}.json`;
    
    // Create response with file download
    const jsonString = JSON.stringify(report, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
    
  } catch (error) {
    console.error('Error exporting sales report:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to export sales report',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
