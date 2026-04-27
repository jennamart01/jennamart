# Jennamart POS - Product Requirements Document (PRD)

## 1. Overview
Jennamart POS (also known as FreePos) is a modern, mobile-responsive Point of Sale system designed for small to medium businesses. It provides a complete workflow for managing products, processing orders, and handling data with robust safety controls.

## 2. Tech Stack
- **Frontend**: Next.js 14 (App Router)
- **UI Framework**: Ionic React (for native-like mobile experience)
- **State Management**: Zustand (with persistent middleware)
- **Database**: MongoDB (via MongoDB Atlas)
- **Styling**: Vanilla CSS + Tailwind (integrated into components)
- **Deployment**: PWA (Progressive Web App) supported

## 3. Application Flow & Processes

### A. Initial Run / Startup
1. **Environment Setup**: App loads `.env` configurations (MONGODB_URI, etc.).
2. **Service Worker Registration**: In `src/app/page.jsx`, the app registers `sw.js` for offline PWA capabilities.
3. **Database Connection**: `src/services/database.js` establishes a singleton connection to MongoDB via `MongoClient`.
4. **Hydration**: Zustand store (`src/stores/posStore.js`) initializes, fetching initial product data via `fetchProducts()`.
5. **Main Interface**: User is presented with `POSLayout`, defaulting to the 'Order' (Cart/Products) tab.

### B. POS / Transaction Flow
1. **Product Selection**: User browses or searches products in `ProductList.jsx`.
2. **Cart Management**: 
   - `addToCart(product)`: Adds item or increments quantity.
   - `removeFromCart(productId)`: Removes item.
   - `updateCartQuantity(productId, quantity)`: Manual quantity adjustment.
3. **Checkout**: User clicks checkout, entering a **required** customer name.
4. **Order Processing**:
   - `processOrder()`: Sends order data to `/api/orders`.
   - **Transaction Integrity**: MongoDB ensures the order is saved and stock updated atomically.
5. **Receipt Generation**:
   - `printReceipt(order)`: Generates a thermal-styled HTML receipt in a hidden iframe (58mm width) for silent printing.
   - Includes automatic removal from print queue after completion.

### C. Order History & Management
1. **Retrieval**: `OrderHistory.jsx` fetches orders via `getOrders()` API.
2. **Filtering & Search**:
   - Search by Order Number, Customer Name, or Product Name.
   - Sort by Newest, Oldest, Highest Total, or Lowest Total.
3. **Reprinting**: Ability to reprint receipts for any past transaction.
4. **Pull-to-Refresh**: Ionic `IonRefresher` for real-time history updates.

### D. Product Management (CRUD)
1. **Create**: `ProductForm.jsx` sends POST to `/api/products`. Includes stock tracking toggle.
2. **Read**: `ProductList.jsx` fetches and displays products with category and stock badges.
3. **Update**: Edit mode in `ProductForm.jsx` sends PUT to `/api/products/[id]`.
4. **Delete**: Sends DELETE to `/api/products/[id]`.

### E. Data Management (Advanced)
1. **Export**:
   - User selects collections (Products/Orders).
   - `/api/export` generates a JSON file with comprehensive metadata (counts, total revenue).
2. **Import**:
   - `ImportProducts.jsx` handles file uploads.
   - Supports multiple JSON schemas (Direct Array, Export Format, Simple Object).
3. **Safe Deletion**:
   - `DeleteData.jsx` handles bulk deletion with safety checks.
   - **7-Day Protection**: Orders from the last 7 days cannot be deleted to prevent accidental loss of recent records.
   - Shows "Revenue Impact" preview before deletion.

### F. Reporting & Analytics
1. **Overview**: Key metrics including Total Penjualan, Total Transaksi, Rata-rata/Transaksi, and Produk Terjual.
2. **Product Analysis**: 
   - Top products list with rank badges (Gold, Silver, Bronze).
   - Performance bars showing sales volume relative to the top seller.
3. **Trend Reporting**: 
   - Daily sales trend with visual bars.
   - Monthly comparison showing revenue growth and unique customer counts.
4. **Export Reports**: Ability to export specific sales reports as JSON.

## 4. Key Functions & Logic

### Client-Side (Zustand: `posStore.js`)
- `processOrder(orderData)`: Validates cart, saves to DB, and adds to print queue.
- `printReceipt(order)`: Injects HTML into an iframe and triggers `window.print()`.
- `fetchProducts()`: Syncs product catalog with server.

### Server-Side (API Routes: `src/app/api/`)
- `POST /api/orders`: Core transaction logic with automatic timestamping and status management.
- `DELETE /api/delete-all`: Implements the complex 7-day exclusion logic based on `fromDate` and `toDate`.
- `GET /api/sales/*`: Aggregates MongoDB data for various report types.

### Database Layer (`database.js`)
- `clientPromise`: Singleton MongoDB client to prevent connection leaks in serverless/HMR environments.
- `DatabaseService`: CRUD wrapper for products and orders.

## 5. Security & Safety Features
- **Validation**: Required customer name and non-empty cart for orders.
- **Safety controls**: Multi-step confirmation for deletions.
- **Database Safety**: 7-day order protection hard-coded in the deletion API.
- **Error Handling**: Toast notifications (success, warning, danger) for all major operations.

## 6. User Interface Architecture
- **IonSplitPane**: Desktop/Tablet split view vs Mobile overlay.
- **Drawer Menu**: Main navigation for Admin functions (Manage, Reports, Export/Import, Settings, Delete).
- **TabBar**: Quick navigation between 'Order' and 'History'.
- **Floating Action Button (FAB)**: Primary "Add Product" action on the products page.

---
*Created on April 27, 2026. Version 2.0.0 Refined.*
