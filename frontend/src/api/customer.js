import { apiRequest } from "./client";

export function getCartApi() {
  return apiRequest("/customer/cart");
}

/**
 * items: [{product_id, quantity}]
 */
export function setCartApi(items) {
  return apiRequest("/customer/cart", { method: "POST", body: { items } });
}

export function placeOrderApi(payload = {}) {
  return apiRequest("/customer/order", { method: "POST", body: payload });
}

export function getOrdersApi() {
  return apiRequest("/customer/orders");
}
