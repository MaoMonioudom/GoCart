import api from './api';

// ================= Seller Dashboard =================

export const getSellerDashboard = async () => {
  const response = await api.get('/seller/dashboard');
  return response.data;
};

// KPI stats
export const getSellerStats = async () => {
  const response = await api.get('/seller/stats');
  return response.data;
};

// Low stock alerts (Restock Alerts)
export const getSellerLowStockAlerts = async () => {
  const response = await api.get('/seller/alerts/low-stock');
  return response.data;
};

// Sales trend analytics
export const getSellerSalesTrend = async () => {
  const response = await api.get('/seller/analytics/sales-trend');
  return response.data;
};

// Quantity analytics (total units sold per product)
export const getSellerQuantityAnalytics = async () => {
  const response = await api.get('/seller/analytics/quantity');
  return response.data;
};

// Comparison analytics (product list with current stock)
export const getSellerComparisonAnalytics = async () => {
  const response = await api.get('/seller/analytics/comparison');
  return response.data;
};

// Next-month ML predictions for seller products
export const getSellerMlPredictions = async (payload = {}) => {
  const response = await api.post('/seller/ml/predict', payload);
  return response.data;
};
