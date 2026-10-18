const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.featured) query.append('featured', 'true');

  const res = await fetch(`${API_BASE}/api/products?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.statusText}`);
  const data = await res.json();
  return data.data || [];
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error(`Product not found`);
  const data = await res.json();
  return data.data;
}

export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to place order');
  }
  const data = await res.json();
  return data.order;
}

export async function fetchOrderStatus(orderId) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}`);
  if (!res.ok) throw new Error(`Failed to check order status`);
  const data = await res.json();
  return data.order;
}

export async function fetchAllOrders() {
  const res = await fetch(`${API_BASE}/api/orders`);
  if (!res.ok) throw new Error(`Failed to fetch orders`);
  const data = await res.json();
  return data.data || [];
}
