import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 0;
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    
    // Remove pagination/sorting params from filter
    const filter = Object.fromEntries(searchParams);
    delete filter.limit;
    delete filter.sort;
    delete filter.order;
    
    const database = await db.getDatabase();
    
    // Build query
    let query = database.collection('orders').find(filter);
    
    // Apply sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    query = query.sort({ [sort]: sortOrder });
    
    // Apply limit if specified
    if (limit > 0) {
      query = query.limit(limit);
    }
    
    const orders = await query.toArray();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const order = await request.json();
    const result = await db.addOrder(order);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding order:', error);
    return NextResponse.json(
      { error: 'Failed to add order' },
      { status: 500 }
    );
  }
}