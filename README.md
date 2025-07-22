# FreePos - Mobile POS System

A modern, mobile-first Point of Sale (POS) system built with Next.js, Ionic React, and MongoDB. Designed for small businesses with a focus on simplicity and mobile optimization.

## 🚀 Features

### Core Functionality
- **Product Management**: Add, edit, delete, and search products
- **Order System**: Create orders with cart functionality
- **Receipt Printing**: Generate and print order receipts
- **Order History**: Track and review past orders
- **Mobile-First Design**: Optimized for tablets and smartphones

### User Experience
- **Enhanced UI**: Clean, intuitive interface with workflow separation
- **Tab Navigation**: Manage | Order | Cart | History workflow
- **Slide-out Menu**: Quick product access with category filtering
- **Cart Badge**: Real-time cart item count with "X items" display
- **Touch-Optimized**: 44px minimum button sizes for mobile interaction

### Technical Features
- **PWA Ready**: Progressive Web App with offline capabilities
- **Responsive Design**: Works on all screen sizes
- **Currency Localization**: Indonesian Rupiah (IDR) formatting
- **Real-time Updates**: Live cart and inventory synchronization

## 🛠 Technology Stack

- **Frontend**: Next.js 14 with App Router
- **UI Framework**: Ionic React 8.6.5
- **Database**: MongoDB 6.17.0
- **State Management**: Zustand 5.0.6
- **Styling**: Tailwind CSS + Ionic CSS
- **Language**: JavaScript/TypeScript Ready

## 📱 Screenshots

The application provides a clean, mobile-optimized interface:

- **Manage Tab**: Product CRUD operations with search and filters
- **Order Tab**: Product selection with dedicated OrderProductList
- **Cart Tab**: Review items, adjust quantities, process orders
- **History Tab**: View past orders with reprint functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account or local MongoDB instance

### Installation

1. **Clone the repository**
```bash
git clone [repository-url]
cd pos
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

4. **Run development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  description: String,
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: Number,
  createdAt: Date
}
```

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── products/      # Product CRUD endpoints
│   │   ├── orders/        # Order management endpoints
│   │   └── health/        # Health check endpoint
│   ├── globals.css        # Global styles
│   ├── layout.jsx         # Root layout
│   └── page.jsx           # Main application page
├── components/            # React components
│   ├── layout/            # Layout components
│   ├── pos/               # POS-specific components
│   └── ui/                # Reusable UI components
├── services/              # External services
│   ├── api.js            # API service layer
│   └── database.js       # MongoDB connection
├── stores/                # State management
│   └── posStore.js       # Zustand store
├── styles/                # Additional styles
└── utils/                 # Utility functions
    └── currency.js       # Currency formatting
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

## 📝 API Endpoints

### Products
- `GET /api/products` - Fetch all products
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Orders
- `GET /api/orders` - Fetch all orders
- `POST /api/orders` - Create new order

### Health
- `GET /api/health` - Health check endpoint

## 🎨 UI Components

### Core Components
- **ProductForm**: Add/edit products with validation
- **ProductList**: Display and manage products with search
- **OrderProductList**: Product selection for orders (separate workflow)
- **Cart**: Shopping cart with quantity controls
- **OrderHistory**: Past orders with receipt functionality

### Layout Components
- **Layout**: Main application wrapper with Ionic setup
- **ClientLayout**: Client-side navigation and state management
- **TabBar**: Bottom navigation with badge support

## 🔄 State Management

The application uses Zustand for state management with the following structure:

```javascript
// Store structure
{
  products: [],           // Product inventory
  currentOrder: {         // Active cart/order
    items: [],
    total: 0,
    orderNumber: null,
    createdAt: null
  },
  activeTab: 'products',  // Current navigation tab
  productFilter: '',      // Search/filter state
  printQueue: []          // Orders ready for printing
}
```

## 🖨 Receipt Printing

The system includes browser-based receipt printing:
- Opens print dialog with formatted receipt
- Displays order details, items, and totals
- Includes order number and timestamp
- Mobile-friendly print layout

## 📱 PWA Configuration

The application is configured as a Progressive Web App:
- App manifest for home screen installation
- Service worker for offline functionality
- Proper viewport and mobile optimization
- Apple Web App support

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel
```

### Manual Deployment
```bash
npm run build
npm run start
```

### Environment Variables
Ensure the following environment variables are set:
- `MONGODB_URI`: MongoDB connection string

## 🔒 Security Considerations

- Environment variables for sensitive data
- Input validation on API endpoints
- MongoDB connection with proper authentication
- No hardcoded credentials in source code

## 🧪 Testing

While this version focuses on core functionality, recommended testing approach:
```bash
# Future testing setup
npm install --save-dev jest @testing-library/react
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Review the documentation in the `memory-bank/` folder
- Check the API endpoints for integration details

## 🔮 Future Enhancements

- User authentication and role-based access
- Inventory management with stock tracking
- Sales analytics and reporting
- Multi-location support
- Integration with payment processors
- Offline mode with data synchronization

---

**FreePos** - Simple, powerful, mobile-first POS system for modern businesses.