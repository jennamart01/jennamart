import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = Object.fromEntries(searchParams);
    
    const orders = await db.getOrders(filter);
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