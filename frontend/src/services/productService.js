import api from './api';

// ============ Seller Product Management ============

// List seller's products
export const getSellerProducts = async (search = null) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);

  const queryString = params.toString();
  const endpoint = queryString ? `/products/seller?${queryString}` : '/products/seller';

  const response = await api.get(endpoint);
  return response.data;
};

// Create product (seller only) - with image upload support
export const createProduct = async (productData) => {
  const response = await api.post('/products/', productData);
  return response.data;
};

// Update product (seller only)
export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

// Delete product (seller only)
export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

// ============ Categories ============

export const getCategories = async () => {
  const response = await api.get('/products/categories');
  return response.data;
};

// ============ Public Product Routes ============

// List all products (public)
export const getProducts = async (categoryId = null, search = null) => {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (search) params.append('search', search);
  
  const response = await api.get(`/products/?${params.toString()}`);
  return response.data;
};

// Get single product (public)
export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

// ============ Customer Routes ============

// Get products for customers (public)
export const getCustomerProducts = async (categoryId = null, search = null) => {
  const params = new URLSearchParams();
  if (categoryId) params.append('category_id', categoryId);
  if (search) params.append('search', search);
  
  const response = await api.get(`/customer/products?${params.toString()}`);
  return response.data;
};

// Get single product for customers (public)
export const getCustomerProduct = async (productId) => {
  const response = await api.get(`/customer/products/${productId}`);
  return response.data;
};

// ============ Orders ============

// Create order
export const createOrder = async (orderData) => {
  const response = await api.post('/customer/orders', orderData);
  return response.data;
};

// List orders
export const getOrders = async () => {
  const response = await api.get('/customer/orders');
  return response.data;
};

// Get single order
export const getOrder = async (orderId) => {
  const response = await api.get(`/customer/orders/${orderId}`);
  return response.data;
};

// Cancel order
export const cancelOrder = async (orderId) => {
  const response = await api.put(`/customer/orders/${orderId}/cancel`);
  return response.data;
};

// ============ Addresses ============

// Add address
export const addAddress = async (addressData) => {
  const response = await api.post('/customer/addresses', addressData);
  return response.data;
};

// List addresses
export const getAddresses = async () => {
  const response = await api.get('/customer/addresses');
  return response.data;
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(`/customer/addresses/${addressId}`, addressData);
  return response.data;
};

// Delete address
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/customer/addresses/${addressId}`);
  return response.data;
};

// ============ Helper Functions ============

// Convert file to base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// ============ Promotions ============

// Create promotion for a product
export const createPromotion = async (productId, promotionData) => {
  const response = await api.post(`/products/${productId}/promotions`, promotionData);
  return response.data;
};

// Get promotions for a product
export const getProductPromotions = async (productId) => {
  const response = await api.get(`/products/${productId}/promotions`);
  return response.data;
};

// Update promotion
export const updatePromotion = async (promoId, promotionData) => {
  const response = await api.put(`/products/promotions/${promoId}`, promotionData);
  return response.data;
};

// Delete promotion
export const deletePromotion = async (promoId) => {
  const response = await api.delete(`/products/promotions/${promoId}`);
  return response.data;
};