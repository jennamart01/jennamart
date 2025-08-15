import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12; // Default to last 12 months
    
    const database = await db.getDatabase();
    
    // Aggregate monthly sales using MongoDB aggregation pipeline
    const monthlySales = await database.collection('orders').aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
          totalItems: {
            $sum: {
              $reduce: {
                input: "$items",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.quantity"] }
              }
            }
          },
          uniqueCustomers: {
            $addToSet: "$customerName"
          }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      },
      {
        $limit: limit
      }
    ]).toArray();
    
    // Format the results
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const formattedMonthlySales = monthlySales.map(month => {
      return {
        year: month._id.year,
        month: month._id.month,
        monthName: monthNames[month._id.month - 1],
        revenue: month.revenue || 0,
        orders: month.orders || 0,
        totalItems: month.totalItems || 0,
        uniqueCustomers: month.uniqueCustomers ? month.uniqueCustomers.length : 0,
        averageOrderValue: month.orders > 0 ? (month.revenue / month.orders) : 0,
        averageItemsPerOrder: month.orders > 0 ? (month.totalItems / month.orders) : 0
      };
    }).reverse(); // Show oldest to newest
    
    // Calculate growth rates
    const monthlySalesWithGrowth = formattedMonthlySales.map((month, index) => {
      let revenueGrowth = null;
      let ordersGrowth = null;
      
      if (index > 0) {
        const previousMonth = formattedMonthlySales[index - 1];
        if (previousMonth.revenue > 0) {
          revenueGrowth = ((month.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);
        }
        if (previousMonth.orders > 0) {
          ordersGrowth = ((month.orders - previousMonth.orders) / previousMonth.orders * 100).toFixed(1);
        }
      }
      
      return {
        ...month,
        revenueGrowth: revenueGrowth ? parseFloat(revenueGrowth) : null,
        ordersGrowth: ordersGrowth ? parseFloat(ordersGrowth) : null
      };
    });
    
    return NextResponse.json(monthlySalesWithGrowth);
    
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch monthly sales',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
