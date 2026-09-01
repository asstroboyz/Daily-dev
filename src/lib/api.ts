import axios from 'axios';

const getDynamicBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8080/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
};

const api = axios.create({
  baseURL: getDynamicBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  config.baseURL = getDynamicBaseURL();
  const token =
    (typeof window !== 'undefined' && localStorage.getItem('ACCESS_TOKEN')) ||
    process.env.NEXT_PUBLIC_ACCESS_TOKEN ||
    'dev-local-token';

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
