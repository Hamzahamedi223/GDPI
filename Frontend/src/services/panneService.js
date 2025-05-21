import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Panne Type Services
export const getAllPanneTypes = async () => {
  const response = await api.get('/panne-types');
  return response.data;
};

export const createPanneType = async (typeData) => {
  const response = await api.post('/panne-types', typeData);
  return response.data;
};

export const updatePanneType = async (id, typeData) => {
  const response = await api.put(`/panne-types/${id}`, typeData);
  return response.data;
};

export const deletePanneType = async (id) => {
  const response = await api.delete(`/panne-types/${id}`);
  return response.data;
};

// Existing Panne Services
export const getAllPannes = async () => {
  const response = await api.get('/pannes');
  return response.data;
};

export const getDepartmentPannes = async (department) => {
  const response = await api.get(`/pannes/department/${department}`);
  return response.data;
};

export const createPanne = async (panneData) => {
  const response = await api.post('/pannes', panneData);
  return response.data;
};

export const updatePanne = async (id, panneData) => {
  const response = await api.put(`/pannes/${id}`, panneData);
  return response.data;
};

export const deletePanne = async (id) => {
  const response = await api.delete(`/pannes/${id}`);
  return response.data;
}; 