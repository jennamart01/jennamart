# Stock Management & Data Management System

This document explains the stock management system and data import/export functionality implemented in Jennamart POS.

## Features

### 1. Stock Tracking Toggle
- Products can have stock tracking enabled or disabled
- When disabled, products are considered to have unlimited stock
- When enabled, stock levels are tracked and updated with each order

### 2. Automatic Stock Updates
- Stock is automatically reduced when orders are processed
- Uses MongoDB transactions to ensure data consistency
- Prevents overselling by checking stock availability before processing orders

### 3. Stock Validation
- Orders are validated against available stock before processing
- Clear error messages when insufficient stock is available
- Supports mixed orders with both tracked and untracked products

### 4. Data Export/Import/Delete ✨ NEW
- **Export Selected Collections**: Choose which collections to export (products, orders, or both)
- **Real-time Statistics**: View collection counts and statistics before export
- **Import Products**: Import products from JSON files
- **Delete Collections**: Permanently delete all data from selected collections
- **Backup & Restore**: Complete data backup and restoration capabilities
- **Multiple Formats**: Support for various JSON formats

## Navigation Menu Access

Access the new features through the navigation drawer:
- **Manage Products**: Product CRUD operations
- **Reports**: Sales analytics (coming soon)
- **Export Data**: Complete data backup functionality
- **Import Products**: Product import from JSON files
- **Delete Data**: Permanently delete collections (⚠️ DANGER ZONE)

## API Endpoints

### Stock Management
- `POST /api/orders/check-stock` - Check stock availability for order items
- `PUT /api/products/[id]/stock` - Update individual product stock level

### Enhanced Order Processing
- `POST /api/orders` - Process order with automatic stock updates

### Data Management ✨ NEW
- `GET /api/export?collections=products,orders` - Export selected collections to JSON file
- `POST /api/import/products` - Import products from JSON file
- `GET /api/stats` - Get collection statistics and counts
- `DELETE /api/delete-all?collections=products,orders&fromDate=2025-01-01&toDate=2025-01-31` - Delete all data from selected collections with date range
- `GET /api/orders/stats?fromDate=2025-01-01&toDate=2025-01-31` - Get order statistics with safety period information

## Data Import/Export Features ✨ NEW

### Export Functionality
- **Selective Export**: Choose specific collections to export (products, orders, or both)
- **Real-time Statistics**: View collection counts, revenue, and last update times
- **Metadata Included**: Export date, version, statistics
- **Automatic Download**: Browser-based file download
- **Dynamic Filenames**: Filenames reflect selected collections (e.g., jennamart-products-2025-07-29.json)

#### Export File Structure
```javascript
{
  "metadata": {
    "exportDate": "2025-07-29T04:00:00.000Z",
    "version": "1.0",
    "source": "Jennamart POS",
    "collections": ["products", "orders"]
  },
  "data": {
    "products": [...],
    "orders": [...]
  },
  "statistics": {
    "totalProducts": 10,
    "totalOrders": 25,
    "totalRevenue": 1500000
  }
}
```

### Import Functionality
- **Multiple Formats**: Supports various JSON structures
- **Validation**: Comprehensive data validation
- **Error Handling**: Detailed error reporting
- **Batch Processing**: Import multiple products at once
- **Flexible Structure**: Accepts different JSON formats

### Delete Functionality ⚠️ NEW
- **Selective Deletion**: Choose specific collections to delete (products, orders, or both)
- **Product Deletion**: Products can be deleted immediately without any restrictions
- **Order Date Range Deletion**: Delete orders within specific date ranges
- **Order Safety Restrictions**: Orders from the last 7 days cannot be deleted
- **Real-time Statistics**: View what will be deleted before confirmation
- **Safety Measures**: Multiple confirmation steps and warnings
- **Complete Removal**: Permanently deletes all data from selected collections
- **Automatic Refresh**: Updates UI and clears cart after deletion

#### Supported Import Formats

1. **Direct Array Format**
```javascript
[
  {
    "name": "Product Name",
    "price": 10000,
    "stock": 50,
    "trackStock": true
  }
]
```

2. **Export Format**
```javascript
{
  "data": {
    "products": [
      {
        "name": "Product Name",
        "price": 10000,
        "stock": 50,
        "trackStock": true
      }
    ]
  }
}
```

3. **Simple Object Format**
```javascript
{
  "products": [
    {
      "name": "Product Name",
      "price": 10000,
      "stock": 50,
      "trackStock": true
    }
  ]
}
```

## Usage Examples

### Stock Management

```javascript
// Add product with stock tracking
const productData = {
  name: "Coffee Beans",
  price: 50000,
  stock: 100,
  trackStock: true
};
await addProduct(productData);

// Process order with automatic stock updates
const result = await processOrder({
  customerName: "John Doe"
});
```

### Data Export/Import/Delete ✨ NEW

```javascript
// Export all collections
await exportAllData(['products', 'orders']);

// Export only products
await exportAllData(['products']);

// Export only orders
await exportAllData(['orders']);

// Get collection statistics
const stats = await api.getStats();
console.log(`Products: ${stats.collections.products.count}`);
console.log(`Orders: ${stats.collections.orders.count}`);
console.log(`Revenue: ${stats.collections.orders.totalRevenue}`);

// Import products from file
const result = await importProducts(file);
console.log(`Imported ${result.imported} products`);

// Delete collections ⚠️ DANGER
await deleteCollections(['products']); // Delete ALL products immediately (no restrictions)
await deleteCollections(['orders']); // Delete orders older than 7 days only
await deleteCollections(['products', 'orders']); // Delete all products + old orders

// Delete orders with date range ⚠️ DANGER
await deleteCollections(['orders'], {
  fromDate: '2024-01-01',
  toDate: '2024-12-31'
}); // Delete orders from 2024 (excluding last 7 days)

// Products are not affected by date range parameters
await deleteCollections(['products'], {
  fromDate: '2024-01-01',  // This is ignored for products
  toDate: '2024-12-31'     // This is ignored for products
}); // Still deletes ALL products regardless of date range

// Get order statistics with safety info
const orderStats = await api.getOrderStats({
  fromDate: '2024-01-01',
  toDate: '2024-12-31'
});
console.log(`Deletable orders: ${orderStats.deletable.count}`);
console.log(`Protected orders: ${orderStats.safetyPeriod.ordersInSafetyPeriod}`);
```

## UI Components

### New Components ✨
- **ExportData**: One-click data export with progress feedback
- **ImportProducts**: File upload with validation and error reporting
- **DeleteData**: Collection deletion with safety measures and confirmations

### Enhanced Navigation
- Menu drawer with export/import options
- Clear navigation between different data management functions

## Sample Data

A sample products file (`sample-products.json`) is included with:
- 10 sample products (Indonesian food & beverages)
- Mix of tracked and untracked stock items
- Various price ranges and stock levels

## Safety Restrictions ⚠️

### Product Deletion
- **No Restrictions**: Products can be deleted immediately without any date limitations
- **Complete Removal**: All products in the collection are deleted at once
- **Immediate Effect**: Deletion happens instantly upon confirmation
- **Cart Impact**: Active shopping cart is cleared if products are deleted

### Order Deletion Safety
- **7-Day Protection**: Orders from the last 7 days cannot be deleted
- **Automatic Calculation**: Safety period is calculated from current date
- **Date Range Validation**: System prevents deletion of protected orders
- **Clear Warnings**: UI shows which orders are protected and why

### Safety Features
- **Multiple Confirmations**: Several confirmation steps before deletion
- **Visual Warnings**: Red color scheme and warning icons throughout
- **Item Count Display**: Shows exactly what will be deleted
- **Revenue Impact**: Shows financial impact of order deletions
- **Protected Order Count**: Displays how many orders are protected

## Best Practices

1. **Regular Backups**: Use export functionality for regular data backups
2. **Validate Import Data**: Always validate JSON files before importing
3. **Test Imports**: Test with small datasets before large imports
4. **Stock Monitoring**: Monitor stock levels regularly
5. **Error Handling**: Handle import/export errors gracefully
6. **⚠️ Delete Safety**: Always export data before using delete functionality
7. **⚠️ Confirm Deletions**: Double-check collection selections before deleting
8. **⚠️ Test Environment**: Test delete operations in development first

## Security & Safety

- Import validation prevents malicious data injection
- File type validation ensures only JSON files are processed
- MongoDB transactions ensure data integrity
- Comprehensive error handling prevents system crashes
