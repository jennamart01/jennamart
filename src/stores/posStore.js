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
    // Browser print functionality for 58mm thermal paper
    const printWindow = window.open('', '', 'width=220,height=600');
    const receiptHTML = `
      <html>
        <head>
          <title>Receipt - Jennamart</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: 58mm auto;
              margin: 0;
              padding: 0;
            }
            
            @media print {
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              body {
                width: 58mm !important;
                max-width: 58mm !important;
                min-width: 58mm !important;
                margin: 0 !important;
                padding: 5px !important;
                font-family: 'Courier New', 'Consolas', monospace !important;
                font-size: 10px !important;
                line-height: 1.1 !important;
                color: #000 !important;
                background: white !important;
                box-sizing: border-box !important;
              }
              
              .thermal-receipt {
                height: auto !important;
                min-height: auto !important;
                max-height: none !important;
                position: relative !important;
              }
              
              .thermal-receipt::before {
                content: '' !important;
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                background-image: url('/icons/icon-192x192.png') !important;
                background-repeat: no-repeat !important;
                background-position: center center !important;
                background-size: 40mm 40mm !important;
                opacity: 0.2 !important;
                z-index: -1 !important;
                pointer-events: none !important;
              }
              
              .no-print { display: none !important; }
            }
            
            body {
              width: 58mm;
              max-width: 58mm;
              margin: 0 auto;
              padding: 5px;
              font-family: 'Courier New', 'Consolas', monospace;
              font-size: 10px;
              line-height: 1.1;
              color: #000;
              background: white;
              box-sizing: border-box;
            }
            
            .thermal-receipt {
              width: 100%;
              max-width: 54mm;
              margin: 0;
              padding: 5px;
              height: auto;
              min-height: auto;
              position: relative;
            }
            
            .thermal-receipt::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-image: url('/icons/icon-192x192.png');
              background-repeat: no-repeat;
              background-position: center center;
              background-size: 40mm 40mm;
              opacity: 0.2;
              z-index: -1;
              pointer-events: none;
            }
              width: 100%;
              max-width: 54mm;
              margin: 0;
              padding: 0;
            }
            
            .receipt-header {
              text-align: center;
              margin-bottom: 2mm;
              border-bottom: 1px dashed #000;
              padding-bottom: 1mm;
            }
            
            .receipt-logo {
              height: 16mm;
              margin: auto;
              display: block;
            }
            
            .order-info {
              font-size: 9px;
              margin: 0.5mm 0;
              line-height: 1.1;
              text-align: center;
            }
            
            .receipt-items {
              margin: 1mm 0;
            }
            
            .receipt-item {
              margin: 0.5mm 0;
              font-size: 10px;
              line-height: 1.1;
            }
            
            .item-line {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin: 0.3mm 0;
            }
            
            .item-name {
              flex: 1;
              margin-right: 2mm;
              word-wrap: break-word;
              overflow-wrap: break-word;
              hyphens: auto;
            }
            
            .item-qty-price {
              text-align: right;
              white-space: nowrap;
              font-size: 10px;
            }
            
            .item-total {
              text-align: right;
              white-space: nowrap;
              font-weight: bold;
              margin-left: auto;
            }
            
            .receipt-separator {
              border-top: 1px dashed #000;
              margin: 1.5mm 0;
              height: 0;
            }
            
            .receipt-total {
              margin: 1mm 0;
              font-weight: bold;
            }
            
            .total-line {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              font-weight: bold;
              margin: 0.5mm 0;
            }
            
            .receipt-footer {
              text-align: center;
              margin-top: 2mm;
              border-top: 1px dashed #000;
              padding-top: 1mm;
              font-size: 10px;
            }
            
            .thank-you {
              font-weight: bold;
              margin: 0.5mm 0;
              line-height: 1.1;
            }
            
            .print-button {
              margin: 5mm auto;
              padding: 2mm 4mm;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 2mm;
              cursor: pointer;
              display: block;
              font-size: 10px;
            }
            
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <div class="thermal-receipt">
            <div class="receipt-header">
              <img src="/icons/logo-print.png" alt="Jennamart Logo" class="receipt-logo" />
              <div class="order-info">Order #${order.orderNumber}</div>
              <div class="order-info">${new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
              })} ${new Date(order.createdAt).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
              <div class="order-info">Customer: ${order.customerName || 'Guest'}</div>
            </div>
            
            <div class="receipt-separator"></div>
            
            <div class="receipt-items">
              ${order.items.map(item => `
                <div class="receipt-item">
                  <div class="item-line">
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty-price">${item.quantity}x ${formatRupiah(item.price)}</div>
                  </div>
                  <div class="item-line">
                    <div class="item-name"></div>
                    <div class="item-total">${formatRupiah(item.price * item.quantity)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="receipt-separator"></div>
            
            <div class="receipt-total">
              <div class="total-line">
                <span>TOTAL:</span>
                <span>${formatRupiah(order.total)}</span>
              </div>
            </div>
            
            <div class="receipt-footer">
              <div class="thank-you">Terima kasih sudah berbelanja</div>
              <div class="thank-you">di Jennamart</div>
            </div>
            
            <button class="print-button no-print" onclick="window.print(); window.close();">Print Receipt</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Auto print after a short delay to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
    }, 500);

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