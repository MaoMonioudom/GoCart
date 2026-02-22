import { apiRequest } from "./client";

export async function fetchProducts() {
  return apiRequest("/products/");
}

export async function fetchProductById(id) {
  return apiRequest(`/products/${id}`);
}

export async function fetchMyProducts() {
  return apiRequest("/products/mine");
}
