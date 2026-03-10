const BASE_URL = "http://localhost:5000"

function getAuthHeaders() {
  const token = localStorage.getItem("token")
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
}

export async function fetchSellerStats() {
  const res = await fetch(`${BASE_URL}/admin/seller/stats`, {
    headers: getAuthHeaders()
  })
  return res.json()
}

export async function fetchCommissionTrend() {
  const res = await fetch(`${BASE_URL}/admin/seller/commission-trend`, {
    headers: getAuthHeaders()
  })
  return res.json()
}

export async function fetchTopSellers() {
  const res = await fetch(`${BASE_URL}/admin/seller/top`, {
    headers: getAuthHeaders()
  })
  return res.json()
}