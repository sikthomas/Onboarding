// src/utils/authFetch.js
// src/utils/authFetch.js
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // ❌ DO NOT set Content-Type for FormData
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  // 🔹 Handle expired or invalid token
  if (response.status === 401) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/auth/login";
    return;
  }

  return response;
}
