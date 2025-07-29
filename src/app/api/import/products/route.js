import { NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database';

const db = new DatabaseService();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Read file content
    const fileContent = await file.text();
    let importData;
    
    try {
      importData = JSON.parse(fileContent);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON file' },
        { status: 400 }
      );
    }
    
    // Extract products from different possible formats
    let products = [];
    
    if (Array.isArray(importData)) {
      // Direct array of products
      products = importData;
    } else if (importData.data && importData.data.products) {
      // Export format with data.products
      products = importData.data.products;
    } else if (importData.products) {
      // Simple format with products key
      products = importData.products;
    } else {
      return NextResponse.json(
        { success: false, error: 'No products found in file' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid products found in file' },
        { status: 400 }
      );
    }
    
    // Validate and clean product data
    const validProducts = [];
    const errors = [];
    
    products.forEach((product, index) => {
      try {
        // Required fields validation
        if (!product.name || typeof product.name !== 'string') {
          errors.push(`Product ${index + 1}: Name is required`);
          return;
        }
        
        if (!product.price || typeof product.price !== 'number' || product.price <= 0) {
          errors.push(`Product ${index + 1}: Valid price is required`);
          return;
        }
        
        // Clean and prepare product data
        const cleanProduct = {
          name: product.name.trim(),
          price: Number(product.price),
          stock: Number(product.stock) || 0,
          trackStock: product.trackStock !== undefined ? Boolean(product.trackStock) : true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Remove _id if present (will be auto-generated)
        delete cleanProduct._id;
        
        validProducts.push(cleanProduct);
      } catch (error) {
        errors.push(`Product ${index + 1}: ${error.message}`);
      }
    });
    
    if (validProducts.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid products to import',
          errors: errors
        },
        { status: 400 }
      );
    }
    
    // Import products to database
    const database = await db.getDatabase();
    const result = await database.collection('products').insertMany(validProducts);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.insertedCount} products`,
      imported: result.insertedCount,
      skipped: products.length - validProducts.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to import products',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
