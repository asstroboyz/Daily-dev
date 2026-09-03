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

function normalizeData(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeData);
  }
  if (obj !== null && typeof obj === 'object') {
    if ('ID' in obj && !('id' in obj)) {
      obj.id = obj.ID;
    }
    if ('CreatedAt' in obj && !('created_at' in obj)) {
      obj.created_at = obj.CreatedAt;
    }
    if ('UpdatedAt' in obj && !('updated_at' in obj)) {
      obj.updated_at = obj.UpdatedAt;
    }
    if ('DeletedAt' in obj && !('deleted_at' in obj)) {
      obj.deleted_at = obj.DeletedAt;
    }
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        obj[key] = normalizeData(obj[key]);
      }
    }
  }
  return obj;
}

api.interceptors.response.use((response) => {
  if (response.data) {
    response.data = normalizeData(response.data);
  }
  return response;
});

export default api;
