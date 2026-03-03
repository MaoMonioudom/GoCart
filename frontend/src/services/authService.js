import api from './api';

// Register new customer
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

// Register as seller (customer must be logged in)
export const registerAsSeller = async (sellerData) => {
  const response = await api.post('/auth/register-seller', sellerData);
  return response.data;
};

// Login
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/auth/profile');
  return response.data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Change password
export const changePassword = async (passwordData) => {
  const response = await api.put('/auth/change-password', passwordData);
  return response.data;
};

// Update seller profile (shop_name, shop_description, bank_account)
export const updateSellerProfile = async (sellerData) => {
  const response = await api.put('/auth/seller-profile', sellerData);
  return response.data;
};

// Get seller statistics (product count, order count, rating)
export const getSellerStatistics = async () => {
  const response = await api.get('/auth/seller-statistics');
  return response.data;
};