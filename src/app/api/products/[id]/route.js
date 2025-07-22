import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const product = await db.getProduct(new ObjectId(id));
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const product = await request.json();
    const result = await db.updateProduct(new ObjectId(id), product);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const result = await db.deleteProduct(new ObjectId(id));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}