import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    const database = await db.getDatabase();
    
    // Default to last 7 days if no date range provided
    let startDate, endDate;
    if (fromDate && toDate) {
      startDate = new Date(fromDate);
      endDate = new Date(toDate);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(endDate.getDate() - 6); // Last 7 days
    }
    
    // Set time boundaries
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    // Aggregate daily sales using MongoDB aggregation pipeline
    const dailySales = await database.collection('orders').aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
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
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]).toArray();
    
    // Format the results
    const formattedDailySales = dailySales.map(day => {
      const date = new Date(day._id.year, day._id.month - 1, day._id.day);
      return {
        date: date.toISOString().split('T')[0],
        revenue: day.revenue || 0,
        orders: day.orders || 0,
        totalItems: day.totalItems || 0,
        averageOrderValue: day.orders > 0 ? (day.revenue / day.orders) : 0
      };
    });
    
    // Fill in missing days with zero values
    const allDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingDay = formattedDailySales.find(day => day.date === dateStr);
      
      if (existingDay) {
        allDays.push(existingDay);
      } else {
        allDays.push({
          date: dateStr,
          revenue: 0,
          orders: 0,
          totalItems: 0,
          averageOrderValue: 0
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return NextResponse.json(allDays);
    
  } catch (error) {
    console.error('Error fetching daily sales:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch daily sales',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
