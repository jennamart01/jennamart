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
}