# Jennamart - Mobile POS System

A modern and intuitive Point of Sale (POS) system designed for small to medium-sized businesses,

## Key Features

- **Mobile-First & Responsive**: Optimized for use on smartphones, tablets, and desktops.
- **Intuitive User Interface**: Clean and easy-to-navigate design for efficient order processing.
- **Product Management**: Add, edit, and manage products with ease.
- **Order Management**: Create new orders, update quantities, and process transactions seamlessly.
- **Order History**: Track and view past orders with details.
- **Receipt Printing**: Generate and print receipts for completed transactions.
- **Offline Capabilities**: (Coming Soon) Basic functionality will be available offline.
- **Progressive Web App (PWA)**: Installable on any device for a native app-like experience.

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
│   ├── components/     # Reusable React components
│   │   ├── layout/     # Layout components
│   │   └── pos/        # Point of Sale specific components
│   │   └── ui/         # Generic UI components
│   ├── services/       # API integration and database services
│   ├── stores/         # Zustand stores for state management
│   ├── styles/         # Global styles
│   └── utils/          # Utility functions (e.g., currency formatting)
├── .env.local          # Environment variables (not committed)
├── next.config.mjs     # Next.js configuration
├── package.json        # Project dependencies and scripts
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md           # Project README
```

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License.

---