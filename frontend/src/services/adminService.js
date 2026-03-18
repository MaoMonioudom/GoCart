/**
 * AdminService - Handles all admin API calls with proper error handling
 * Uses centralized token management and consistent headers
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class AdminService {
  constructor(token) {
    if (!token) {
      throw new Error('AdminService requires a valid token');
    }
    this.token = token;
    this.apiBase = API_BASE;
  }

  /**
   * Generic fetch with auth header and error handling
   * @param {string} endpoint - API endpoint (e.g., '/admin/seller/stats')
   * @param {object} options - Fetch options
   * @returns {Promise} Response JSON
   * @throws {Error} If request fails
   */
  async fetchWithAuth(endpoint, options = {}) {
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.apiBase}${endpoint}`, {
        ...options,
        headers,
      });

      // Check for HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Response wasn't JSON, use default message
        }

        const error = new Error(errorMessage);
        error.status = response.status;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw with additional context
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // ============================================
  // SELLER ENDPOINTS
  // ============================================

  /**
   * Get seller dashboard statistics
   */
  async getSellerStats() {
    return this.fetchWithAuth('/admin/seller/stats');
  }

  /**
   * Get commission trend data
   * @param {string} group - 'year' or 'month'
   */
  async getCommissionTrend(group = 'month') {
    if (!['year', 'month'].includes(group)) {
      throw new Error('Group must be "year" or "month"');
    }
    return this.fetchWithAuth(`/admin/seller/commission-trend?group=${group}`);
  }

  /**
   * Get commission by category
   * @param {string} group - 'year' or 'month'
   */
  async getCategoryCommission(group = 'month') {
    if (!['year', 'month'].includes(group)) {
      throw new Error('Group must be "year" or "month"');
    }
    return this.fetchWithAuth(`/admin/seller/category-commission?group=${group}`);
  }

  /**
   * Get seller registration trend
   */
  async getRegistrationTrend() {
    return this.fetchWithAuth('/admin/seller/registration-trend');
  }

  /**
   * Get seller status overview (active, inactive, suspended)
   */
  async getStatusOverview() {
    return this.fetchWithAuth('/admin/seller/status-overview');
  }

  /**
   * Get top sellers list
   */
  async getTopSellers() {
    const data = await this.fetchWithAuth('/admin/seller/top');
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('getTopSellers: Expected array, got:', typeof data);
      return [];
    }
    
    return data;
  }

  /**
   * Get seller detail by ID
   * @param {number} sellerId
   */
  async getSellerDetail(sellerId) {
    return this.fetchWithAuth(`/admin/seller/${sellerId}`);
  }

  /**
   * Update seller information
   * @param {number} sellerId
   * @param {object} data - { shop_name, status, ... }
   */
  async updateSeller(sellerId, data) {
    return this.fetchWithAuth(`/admin/seller/${sellerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete seller
   * @param {number} sellerId
   */
  async deleteSeller(sellerId) {
    return this.fetchWithAuth(`/admin/seller/${sellerId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // CUSTOMER ENDPOINTS
  // ============================================

  /**
   * Get customer statistics
   */
  async getCustomerStats() {
    return this.fetchWithAuth('/admin/customers/stats');
  }

  /**
   * Get customer overview with trend
   * @param {string} range - 'this_week', 'this_month', etc.
   */
  async getCustomerOverview(range = 'this_week') {
    return this.fetchWithAuth(`/admin/customers/overview?range=${range}`);
  }

  /**
   * Get paginated customer list
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   */
  async getCustomers(page = 1, limit = 10) {
    return this.fetchWithAuth(
      `/admin/customers?page=${page}&limit=${limit}`
    );
  }

  /**
   * Get customer detail
   * @param {number} userId
   */
  async getCustomerDetail(userId) {
    return this.fetchWithAuth(`/admin/customer/${userId}`);
  }

  /**
   * Update customer information
   * @param {number} userId
   * @param {object} data
   */
  async updateCustomer(userId, data) {
    return this.fetchWithAuth(`/admin/customer/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete customer
   * @param {number} userId
   */
  async deleteCustomer(userId) {
    return this.fetchWithAuth(`/admin/customer/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // ML INSIGHTS ENDPOINTS
  // ============================================

  /**
   * Get most viewed products
   */
  async getMostViewed() {
    return this.fetchWithAuth('/admin/ml/most-viewed');
  }

  /**
   * Get most purchased products
   */
  async getMostPurchased() {
    return this.fetchWithAuth('/admin/ml/most-purchased');
  }

  /**
   * Get purchase frequency insights
   */
  async getPurchaseFrequency() {
    return this.fetchWithAuth('/admin/ml/purchase-frequency');
  }

  /**
   * Get conversion rate
   */
  async getConversionRate() {
    return this.fetchWithAuth('/admin/ml/conversion-rate');
  }

  /**
   * Get recommendation accuracy metrics
   */
  async getRecommendationAccuracy() {
    return this.fetchWithAuth('/admin/ml/recommendation-accuracy');
  }

  /**
   * Get user behavior insights
   */
  async getUserBehavior() {
    return this.fetchWithAuth('/admin/ml/user-behavior');
  }

  // ============================================
  // PROFILE ENDPOINTS
  // ============================================

  /**
   * Get admin profile
   */
  async getAdminProfile() {
    return this.fetchWithAuth('/admin/profile');
  }

  /**
   * Update admin profile
   * @param {object} data
   */
  async updateAdminProfile(data) {
    return this.fetchWithAuth('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get system statistics
   */
  async getSystemStats() {
    return this.fetchWithAuth('/admin/system-stats');
  }
}

export default AdminService;