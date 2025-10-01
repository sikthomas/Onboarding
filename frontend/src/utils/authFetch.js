// src/utils/authFetch.js
export async function authFetch(url, options = {}) {
  const token = localStorage.getItem("access");

  // Attach Authorization Header automatically
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  // 🔹 Check for expired or invalid token
  if (response.status === 401) {
    // Token expired or invalid → Redirect to login
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/auth/login";
    return;
  }

  return response;
}
