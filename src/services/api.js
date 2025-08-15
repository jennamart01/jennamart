// API service for client-side database operations
// This service handles API calls to Next.js API routes

export class APIService {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Products API
  async getProducts(filter = {}) {
    const queryParams = new URLSearchParams(filter).toString();
    const endpoint = `/products${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async addProduct(product) {
    return this.request('/products', {
      method: 'POST',
      body: product,
    });
  }

  async updateProduct(id, product) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: product,
    });
  }

  async deleteProduct(id) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Orders API
  async getOrders(filter = {}) {
    const queryParams = new URLSearchParams(filter).toString();
    const endpoint = `/orders${queryParams ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async addOrder(order) {
    return this.request('/orders', {
      method: 'POST',
      body: order,
    });
  }

  async updateOrder(id, order) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: order,
    });
  }

  // Test connection
  async testConnection() {
    try {
      await this.request('/health');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  // Export/Import API
  async exportAllData(selectedCollections = ['products', 'orders']) {
    try {
      const collectionsParam = selectedCollections.join(',');
      const response = await fetch(`/api/export?collections=${collectionsParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'jennamart-export.json';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { 
        success: true, 
        message: 'Export completed successfully',
        collections: selectedCollections,
        filename: filename
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  async importProducts(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/import/products', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }
      
      return data;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }

  // Statistics API
  async getStats() {
    return this.request('/stats');
  }

  // Delete collections API
  async deleteCollections(selectedCollections, dateRange = null) {
    let url = `/api/delete-all?collections=${selectedCollections.join(',')}`;
    
    // Add date range parameters for orders
    if (dateRange && selectedCollections.includes('orders')) {
      if (dateRange.fromDate) {
        url += `&fromDate=${dateRange.fromDate}`;
      }
      if (dateRange.toDate) {
        url += `&toDate=${dateRange.toDate}`;
      }
    }
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }
      
      return data;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  // Order statistics API
  async getOrderStats(dateRange = null) {
    let url = '/orders/stats';
    const params = new URLSearchParams();
    
    if (dateRange) {
      if (dateRange.fromDate) params.append('fromDate', dateRange.fromDate);
      if (dateRange.toDate) params.append('toDate', dateRange.toDate);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  // Sales Reports API
  async getSalesStats(dateFilter = null) {
    let url = '/sales/stats';
    const params = new URLSearchParams();
    
    if (dateFilter) {
      if (dateFilter.fromDate) params.append('fromDate', dateFilter.fromDate.toISOString());
      if (dateFilter.toDate) params.append('toDate', dateFilter.toDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  async getTopProducts(dateFilter = null, limit = 10) {
    let url = '/sales/top-products';
    const params = new URLSearchParams();
    
    if (dateFilter) {
      if (dateFilter.fromDate) params.append('fromDate', dateFilter.fromDate.toISOString());
      if (dateFilter.toDate) params.append('toDate', dateFilter.toDate.toISOString());
    }
    
    params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  async getDailySales(dateFilter = null) {
    let url = '/sales/daily';
    const params = new URLSearchParams();
    
    if (dateFilter) {
      if (dateFilter.fromDate) params.append('fromDate', dateFilter.fromDate.toISOString());
      if (dateFilter.toDate) params.append('toDate', dateFilter.toDate.toISOString());
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  async getMonthlySales(limit = 12) {
    let url = '/sales/monthly';
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  async getRecentOrders(limit = 10) {
    let url = '/orders';
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('sort', 'createdAt');
    params.append('order', 'desc');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return this.request(url);
  }

  async exportSalesReport(dateFilter = null, reportType = 'overview') {
    try {
      let url = '/api/sales/export';
      const params = new URLSearchParams();
      
      if (dateFilter) {
        if (dateFilter.fromDate) params.append('fromDate', dateFilter.fromDate.toISOString());
        if (dateFilter.toDate) params.append('toDate', dateFilter.toDate.toISOString());
      }
      
      params.append('type', reportType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `sales-report-${reportType}.json`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      return { 
        success: true, 
        message: 'Sales report exported successfully',
        filename: filename
      };
    } catch (error) {
      console.error('Export sales report failed:', error);
      throw error;
    }
  }
}