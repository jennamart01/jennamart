# Jennamart - Mobile POS System

A modern and intuitive Point of Sale (POS) system designed for small to medium-sized businesses, featuring comprehensive data management and safety controls.

## Key Features

### Core POS Functionality
- **Mobile-First & Responsive**: Optimized for use on smartphones, tablets, and desktops.
- **Intuitive User Interface**: Clean and easy-to-navigate design for efficient order processing.
- **Product Management**: Add, edit, and manage products with stock tracking capabilities.
- **Order Management**: Create new orders, update quantities, and process transactions seamlessly.
- **Order History**: Track and view past orders with details.
- **Receipt Printing**: Generate and print receipts for completed transactions.
- **Progressive Web App (PWA)**: Installable on any device for a native app-like experience.

### Advanced Data Management ✨ NEW
- **Export Data**: Export selected collections (products, orders) to JSON with real-time statistics
- **Import Products**: Import products from JSON files with comprehensive validation
- **Delete Collections**: Safely delete data with collection selection and date range filtering
- **Stock Management**: Advanced inventory tracking with automatic stock updates
- **Safety Controls**: 7-day protection for recent orders and multiple confirmation steps

### Stock Management System
- **Stock Tracking Toggle**: Enable/disable stock tracking per product
- **Automatic Updates**: Stock levels automatically updated during order processing
- **Transaction Safety**: MongoDB transactions ensure data consistency
- **Stock Validation**: Prevents overselling with real-time stock checks

## Technologies Used

- **Next.js 14**: A React framework for building fast and scalable web applications.
- **Ionic React**: UI framework for building performant, high-quality mobile and desktop apps.
- **Zustand**: A fast and lightweight state-management solution for React.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: MongoDB object data modeling (ODM) for Node.js.
- **Tailwind CSS**: (Removed) Utility-first CSS framework for rapid UI development.
- **ESLint & Prettier**: Code linting and formatting for consistent code quality.

## Getting Started

Follow these steps to set up and run Jennamart locally:

### Prerequisites

- Node.js (v18 or higher)
- npm or Yarn (Yarn recommended)
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/jennamart.git
   cd jennamart
   ```

2. **Install dependencies**:

   ```bash
   yarn install
   # or npm install
   ```

3. **Set up Environment Variables**:

   Create a `.env.local` file in the root directory and add your MongoDB connection string:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

   Replace `your_mongodb_connection_string` with your actual MongoDB connection URI (e.g., from MongoDB Atlas).

4. **Run the Development Server**:

   ```bash
   yarn dev
   # or npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
Jennamart/
├── public/             # Static assets (icons, manifest, service worker)
├── src/
│   ├── app/            # Next.js App Router (pages, API routes)
│   │   ├── api/        # API endpoints
│   │   │   ├── export/ # Data export functionality
│   │   │   ├── import/ # Data import functionality
│   │   │   ├── delete-all/ # Collection deletion with safety
│   │   │   ├── orders/ # Order management and statistics
│   │   │   ├── products/ # Product CRUD operations
│   │   │   └── stats/  # Collection statistics
│   ├── components/     # Reusable React components
│   │   ├── layout/     # Layout components
│   │   └── pos/        # Point of Sale specific components
│   │   │   ├── ExportData.jsx # Data export interface
│   │   │   ├── ImportProducts.jsx # Product import interface
│   │   │   ├── DeleteData.jsx # Data deletion with safety controls
│   │   │   ├── ProductList.jsx # Product management
│   │   │   ├── OrderHistory.jsx # Order tracking
│   │   │   └── Cart.jsx # Shopping cart functionality
│   │   └── ui/         # Generic UI components
│   ├── services/       # API integration and database services
│   ├── stores/         # Zustand stores for state management
│   ├── styles/         # Global styles
│   └── utils/          # Utility functions (e.g., currency formatting)
├── scripts/            # Utility scripts
│   └── clear-products.js # Product deletion script
├── sample-products.json # Sample data for testing imports
├── DATA_MANAGEMENT.md  # Comprehensive data management documentation
├── .env.local          # Environment variables (not committed)
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # Project README
```

## Detailed Features

### 📊 Data Management System
- **Export Collections**: 
  - Select specific collections (products, orders, or both)
  - Real-time statistics display
  - Dynamic filename generation
  - JSON format with metadata
- **Import Products**: 
  - Multiple JSON format support
  - Comprehensive validation
  - Batch processing with error reporting
- **Delete Collections**: 
  - Selective deletion with safety measures
  - Date range filtering for orders
  - 7-day protection for recent orders
  - Multiple confirmation steps

### 🛡️ Safety & Security Features
- **Order Protection**: Recent orders (last 7 days) cannot be deleted
- **Data Validation**: Comprehensive input validation for imports
- **Transaction Safety**: MongoDB transactions ensure data consistency
- **Multiple Confirmations**: Several confirmation steps for destructive operations
- **Error Handling**: Graceful error handling with user-friendly messages

### 📱 Navigation & UI
- **Menu Drawer Navigation**: 
  - Manage Products
  - Reports (coming soon)
  - Export Data
  - Import Products
  - Delete Data (with danger indicators)
- **Real-time Statistics**: Live data counts and revenue information
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Visual Feedback**: Progress indicators and status messages

### 🔄 Stock Management
- **Toggle Stock Tracking**: Enable/disable per product
- **Automatic Stock Updates**: Real-time inventory updates during orders
- **Stock Validation**: Prevents overselling with availability checks
- **Mixed Product Support**: Handle both tracked and untracked products

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.

---