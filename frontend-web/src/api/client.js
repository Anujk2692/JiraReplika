export const getBaseUrl = () => {
  if (typeof window !== 'undefined' && localStorage.getItem('jira_api_url')) {
    return localStorage.getItem('jira_api_url');
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
};

export const setCustomApiUrl = (url) => {
  if (!url) {
    localStorage.removeItem('jira_api_url');
  } else {
    const formatted = url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`;
    localStorage.setItem('jira_api_url', formatted);
  }
};

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('jira_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Unauthorized / expired token
    localStorage.removeItem('jira_token');
    localStorage.removeItem('jira_user');
    window.dispatchEvent(new CustomEvent('jira_auth_logout'));
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorMsg = errorJson.message;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json();
}
