import axios from "axios";

const API_URL = "http://localhost:5000/api";

const UserService = {
  login: async (credentials) => {
    return axios.post(`${API_URL}/auth/login`, credentials, {
      headers: {
        'Content-Type': 'application/json',
      },
      params: {
        include: 'department,role'
      }
    });
  },

  signup: async (userData) => {
    return axios.post(`${API_URL}/auth/signup`, userData);
  },

  verifyEmail: async (token) => {
    return axios.get(`${API_URL}/auth/verify-email/${token}`);
  },

  requestPasswordReset: async (email) => {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await axios.post(`${API_URL}/auth/reset-password`, {
      token,
      password
    });
    return response.data;
  }
};

export default UserService;
