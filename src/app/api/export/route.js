import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionsParam = searchParams.get('collections');
    
    // Parse selected collections, default to all if none specified
    let selectedCollections = ['products', 'orders'];
    if (collectionsParam) {
      selectedCollections = collectionsParam.split(',').filter(c => ['products', 'orders'].includes(c));
    }
    
    const database = await db.getDatabase();
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        source: 'Jennamart POS',
        collections: selectedCollections
      },
      data: {},
      statistics: {}
    };
    
    // Export selected collections
    if (selectedCollections.includes('products')) {
      const products = await database.collection('products').find({}).toArray();
      exportData.data.products = products;
      exportData.statistics.totalProducts = products.length;
    }
    
    if (selectedCollections.includes('orders')) {
      const orders = await database.collection('orders').find({}).toArray();
      exportData.data.orders = orders;
      exportData.statistics.totalOrders = orders.length;
      exportData.statistics.totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    }
    
    // Generate filename based on selected collections
    const collectionsStr = selectedCollections.join('-');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `jennamart-${collectionsStr}-${dateStr}.json`;
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: headers
    });
    
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to export data',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
