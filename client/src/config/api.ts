// api.ts - API Configuration for Viurl Frontend

// Determine API URL based on environment
const getApiUrl = () => {
  // Use relative URLs - let nginx handle the proxying
  return '/api';
};

export const API_BASE_URL = getApiUrl();

// For any fetch operations, just use relative URLs
export default {
  baseURL: API_BASE_URL
};
