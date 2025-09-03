import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // This is crucial for cookies to work
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Schedules API
export const schedulesAPI = {
  // Get all schedules
  getAll: async () => {
    try {
      const response = await api.get('/schedules');
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  // Create a schedule
  create: async (payload) => {
    try {
      const response = await api.post('/schedules', payload);
      return response.data;
    } catch (error) {
      // Bubble up API error message if present
      const message = error?.response?.data?.message || 'Failed to create schedule';
      throw new Error(message);
    }
  },

  // Update a schedule
  update: async (id, payload) => {
    try {
      const response = await api.put(`/schedules/${id}`, payload);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to update schedule';
      throw new Error(message);
    }
  },

  // Delete a schedule
  delete: async (id) => {
    try {
      const response = await api.delete(`/schedules/${id}`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to delete schedule';
      throw new Error(message);
    }
  },

  // Get schedules by day
  getByDay: async (day) => {
    try {
      const response = await api.get('/schedules');
      const allSchedules = response.data.schedules;
      return allSchedules.filter(schedule => schedule.day === day);
    } catch (error) {
      console.error('Error fetching schedules by day:', error);
      throw error;
    }
  },

  // Get schedules by service and time
  getByServiceAndTime: async (service, time) => {
    try {
      const response = await api.get('/schedules');
      const allSchedules = response.data.schedules;
      return allSchedules.filter(schedule => 
        schedule.service === service && schedule.time === time
      );
    } catch (error) {
      console.error('Error fetching schedules by service and time:', error);
      throw error;
    }
  },

  // Test API connection
  test: async () => {
    try {
      const response = await api.get('/schedules/test');
      return response.data;
    } catch (error) {
      console.error('Error testing API:', error);
      throw error;
    }
  }
};

// Authentication API
export const authAPI = {
  // User login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  },

  // User registration
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  // User logout
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Logout failed';
      throw new Error(message);
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to get user data';
      throw new Error(message);
    }
  },

  // Get team members
  getTeamMembers: async (team) => {
    try {
      const response = await api.get(`/auth/team-members/${encodeURIComponent(team)}`);
      return response.data;
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to get team members';
      throw new Error(message);
    }
  }
};

export default api;