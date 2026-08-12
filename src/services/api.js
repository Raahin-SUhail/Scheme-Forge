const rawBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';
const BASE_URL = rawBase.replace(/\/+$/, '');

/**
 * Universal API Request Wrapper
 */
async function apiRequest(endpoint, options = {}) {
  const { query, body, signal, headers, ...customConfig } = options;

  let url = `${BASE_URL}${endpoint}`;
  
  // Clean & Serialize Query Parameters
  if (query && typeof query === 'object') {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'All') {
        params.append(key, value);
      }
    });
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const config = {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal,
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

// REST Endpoints
export const getHealth = async () => apiRequest('/health');
export const getSchemes = async (params, options) => apiRequest('/schemes', { query: params, signal: options?.signal });
export const getSchemeById = async (id, options) => apiRequest(`/schemes/${id}`, { signal: options?.signal });
export const getSchemeSources = async (id) => apiRequest(`/schemes/${id}/sources`);
export const getCategories = async (options) => apiRequest('/categories', { signal: options?.signal });
export const getStats = async (options) => apiRequest('/stats', { signal: options?.signal });

// Eligibility Endpoints
export const findEligibleSchemes = async (profile, options = {}) => {
  const { includeIneligible = true, signal } = options;
  return apiRequest('/find-schemes', {
    method: 'POST',
    body: profile,
    query: { includeIneligible: includeIneligible ? 'true' : 'false' },
    signal
  });
};

export const checkSchemeEligibility = async (id, profile) => apiRequest(`/schemes/${id}/check-eligibility`, { method: 'POST', body: profile });

// Contact Endpoint
export const submitContactForm = async (formData) => apiRequest('/contact', { method: 'POST', body: formData });

// Phase 6 AI Endpoints
export const askSchemeAssistant = async (message, profile, options) => apiRequest('/ai/assistant', { method: 'POST', body: { message, profile }, signal: options?.signal });
export const aiSchemeSearch = async (query, options) => apiRequest('/ai/search', { method: 'POST', body: { query }, signal: options?.signal });
