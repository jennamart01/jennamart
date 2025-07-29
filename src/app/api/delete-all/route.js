import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionsParam = searchParams.get('collections');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    if (!collectionsParam) {
      return NextResponse.json(
        { success: false, error: 'No collections specified' },
        { status: 400 }
      );
    }
    
    // Parse selected collections
    const selectedCollections = collectionsParam.split(',').filter(c => ['products', 'orders'].includes(c));
    
    if (selectedCollections.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid collections specified' },
        { status: 400 }
      );
    }
    
    const database = await db.getDatabase();
    const results = {};
    
    // Calculate safety date (7 days ago from today)
    const today = new Date();
    const safetyDate = new Date(today);
    safetyDate.setDate(today.getDate() - 7);
    safetyDate.setHours(0, 0, 0, 0); // Start of day
    
    // Delete selected collections
    for (const collection of selectedCollections) {
      const collectionRef = database.collection(collection);
      let deleteFilter = {};
      let countFilter = {};
      
      // For orders, apply date filtering and safety restrictions
      if (collection === 'orders') {
        if (fromDate || toDate) {
          const dateFilter = {};
          
          if (fromDate) {
            const fromDateTime = new Date(fromDate);
            fromDateTime.setHours(0, 0, 0, 0);
            
            // Check if fromDate is within safety period
            if (fromDateTime > safetyDate) {
              return NextResponse.json(
                { 
                  success: false, 
                  error: `Cannot delete orders from ${fromDate}. Orders from the last 7 days (since ${safetyDate.toISOString().split('T')[0]}) cannot be deleted for safety reasons.`,
                  safetyDate: safetyDate.toISOString().split('T')[0]
                },
                { status: 400 }
              );
            }
            
            dateFilter.$gte = fromDateTime;
          }
          
          if (toDate) {
            const toDateTime = new Date(toDate);
            toDateTime.setHours(23, 59, 59, 999);
            
            // Ensure toDate is not within safety period
            if (toDateTime > safetyDate) {
              return NextResponse.json(
                { 
                  success: false, 
                  error: `Cannot delete orders up to ${toDate}. Orders from the last 7 days (since ${safetyDate.toISOString().split('T')[0]}) cannot be deleted for safety reasons.`,
                  safetyDate: safetyDate.toISOString().split('T')[0]
                },
                { status: 400 }
              );
            }
            
            dateFilter.$lte = toDateTime;
          }
          
          if (Object.keys(dateFilter).length > 0) {
            deleteFilter.createdAt = dateFilter;
            countFilter.createdAt = dateFilter;
          }
        } else {
          // If no date range specified, only delete orders older than safety period
          deleteFilter.createdAt = { $lt: safetyDate };
          countFilter.createdAt = { $lt: safetyDate };
        }
      }
      // For products, no date filtering - delete all products
      // deleteFilter and countFilter remain empty objects for products
      
      // Get count before deletion
      const countBefore = await collectionRef.countDocuments(countFilter);
      
      if (countBefore > 0) {
        // Delete documents matching the filter
        const deleteResult = await collectionRef.deleteMany(deleteFilter);
        results[collection] = {
          previousCount: countBefore,
          deletedCount: deleteResult.deletedCount,
          success: deleteResult.deletedCount === countBefore,
          filter: collection === 'orders' ? deleteFilter : undefined
        };
      } else {
        results[collection] = {
          previousCount: 0,
          deletedCount: 0,
          success: true,
          message: collection === 'orders' && (fromDate || toDate) 
            ? 'No orders found in the specified date range (excluding safety period)'
            : `${collection} collection was already empty`
        };
      }
    }
    
    // Calculate totals
    const totalDeleted = Object.values(results).reduce((sum, result) => sum + result.deletedCount, 0);
    const allSuccessful = Object.values(results).every(result => result.success);
    
    return NextResponse.json({
      success: allSuccessful,
      message: `Successfully deleted ${totalDeleted} items from ${selectedCollections.length} collection(s)`,
      collections: selectedCollections,
      results: results,
      totalDeleted: totalDeleted,
      safetyDate: safetyDate.toISOString().split('T')[0],
      dateRange: fromDate || toDate ? { fromDate, toDate } : null
    });
    
  } catch (error) {
    console.error('Error deleting collections:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete collections',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
