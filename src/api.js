// client/src/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
});

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  console.log(`→ [${config.method.toUpperCase()}] ${config.url}  token:`, token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default apiClient;

