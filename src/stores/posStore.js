import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { APIService } from '@/services/api';
import { formatRupiah } from '@/utils/currency';

const api = new APIService();

const usePOSStore = create(
  subscribeWithSelector((set, get) => ({
  // Product Management
  products: [],
  productFilter: '',
  isLoading: false,

  // Order/Cart Management
  currentOrder: {
    items: [],
    total: 0,
    orderNumber: null,
    createdAt: null,
  },

  // UI State
  activeTab: 'order',
  printQueue: [],

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setProductFilter: (filter) => set({ productFilter: filter }),

  // Product Actions
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await api.getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ isLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      await api.addProduct(product);
      // Refresh products list
      get().fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  updateProduct: async (id, product) => {
    try {
      await api.updateProduct(id, product);
      // Refresh products list
      get().fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await api.deleteProduct(id);
      // Refresh products list
      get().fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Cart/Order Actions
  addToCart: (product, quantity = 1) => {
    const { currentOrder } = get();
    const existingItem = currentOrder.items.find(item => item.productId === product._id);
    
    let updatedItems;
    if (existingItem) {
      updatedItems = currentOrder.items.map(item =>
        item.productId === product._id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedItems = [
        ...currentOrder.items,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ];
    }

    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total,
      },
    });
  },

  removeFromCart: (productId) => {
    const { currentOrder } = get();
    const updatedItems = currentOrder.items.filter(item => item.productId !== productId);
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total,
      },
    });
  },

  updateCartQuantity: (productId, quantity) => {
    const { currentOrder } = get();
    const updatedItems = currentOrder.items.map(item =>
      item.productId === productId ? { ...item, quantity } : item
    );
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    set({
      currentOrder: {
        ...currentOrder,
        items: updatedItems,
        total,
      },
    });
  },

  clearCart: () => {
    set({
      currentOrder: {
        items: [],
        total: 0,
        orderNumber: null,
        createdAt: null,
      },
    });
  },

  processOrder: async (orderData = {}) => {
    const { currentOrder } = get();
    if (currentOrder.items.length === 0) {
      throw new Error('Cart is empty');
    }

    try {
      const order = {
        items: currentOrder.items,
        total: currentOrder.total,
        customerName: orderData.customerName || 'Guest',
        createdAt: new Date(),
      };
      
      const result = await api.addOrder(order);
      
      // Add to print queue
      const printOrder = {
        ...order,
        orderNumber: `ORD-${Date.now()}`,
      };
      
      set(state => ({
        printQueue: [...state.printQueue, printOrder],
      }));

      // Clear cart
      get().clearCart();

      return result;
    } catch (error) {
      console.error('Error processing order:', error);
      throw error;
    }
  },

  // Print Actions
  printReceipt: (order) => {
    // Browser print functionality
    const printWindow = window.open('', '', 'width=300,height=600');
    const receiptHTML = `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 10px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; margin-top: 10px; padding-top: 10px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Jennamart</h2>
            <p>Order #${order.orderNumber}</p>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
            <p>Customer: ${order.customerName || 'Guest'}</p>
          </div>
          ${order.items.map(item => `
            <div class="item">
              <span>${item.name} x${item.quantity}</span>
              <span>${formatRupiah(item.price * item.quantity)}</span>
            </div>
          `).join('')}
          <div class="total">
            <div class="item">
              <span>Total:</span>
              <span>${formatRupiah(order.total)}</span>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();

    // Remove from print queue
    set(state => ({
      printQueue: state.printQueue.filter(item => item.orderNumber !== order.orderNumber),
    }));
  },

  // Utility Actions
  testDatabaseConnection: async () => {
    try {
      const isConnected = await api.testConnection();
      return isConnected;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  },

  // Export/Import Actions
  exportAllData: async (selectedCollections = ['products', 'orders']) => {
    try {
      const result = await api.exportAllData(selectedCollections);
      return result;
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  },

  importProducts: async (file) => {
    try {
      const result = await api.importProducts(file);
      // Refresh products list after import
      get().fetchProducts();
      return result;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  },

  deleteCollections: async (selectedCollections, dateRange = null) => {
    try {
      const result = await api.deleteCollections(selectedCollections, dateRange);
      // Refresh products list if products were deleted
      if (selectedCollections.includes('products')) {
        get().fetchProducts();
      }
      // Clear cart if products were deleted
      if (selectedCollections.includes('products')) {
        get().clearCart();
      }
      return result;
    } catch (error) {
      console.error('Delete collections failed:', error);
      throw error;
    }
  },

  getOrderStats: async (dateRange = null) => {
    try {
      const result = await api.getOrderStats(dateRange);
      return result;
    } catch (error) {
      console.error('Get order stats failed:', error);
      throw error;
    }
  },
})));

export default usePOSStore;