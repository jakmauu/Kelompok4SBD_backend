import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Membuat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Services
export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/users/login', { username, password });
      if (response.data.userId) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  register: async (username, email, password, role = 'user') => {
    try {
      const response = await api.post('/users/register', { username, email, password, role });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
};

// Assignment Services
export const assignmentService = {
  // Admin: Membuat tugas baru
  createAssignment: async (assignmentData) => {
    try {
      const response = await api.post('/assignments', assignmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Get semua tugas (admin) atau tugas yang ditugaskan (user)
  getAssignments: async (userId, isAdmin) => {
    const queryParam = isAdmin ? `adminId=${userId}` : `userId=${userId}`;
    try {
      const response = await api.get(`/assignments?${queryParam}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Get detail tugas berdasarkan ID
  getAssignmentById: async (id, userId, isAdmin) => {
    const queryParam = isAdmin ? `adminId=${userId}` : `userId=${userId}`;
    try {
      const response = await api.get(`/assignments/${id}?${queryParam}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Get tugas dengan deadline mendekat (untuk user)
  getDeadlineAssignments: async (userId) => {
    try {
      const response = await api.get(`/assignments/deadline?userId=${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // User: Submit tugas dengan form data (teks + file)
  submitAssignmentWithFiles: async (assignmentId, userId, content, files) => {
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('content', content || '');
      
      if (files && files.length > 0) {
        // Bisa multiple files
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
      }

      const response = await api.post(
        `/assignments/${assignmentId}/submit-form`, 
        formData, 
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Admin: Melihat semua submission untuk tugas tertentu
  getSubmissions: async (assignmentId, adminId) => {
    try {
      const response = await api.get(`/assignments/${assignmentId}/submissions?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Admin: Memberikan nilai pada submission
  gradeSubmission: async (assignmentId, submissionId, userId, grade, feedback) => {
    try {
      const response = await api.put(
        `/assignments/${assignmentId}/submissions/${submissionId}/grade`, 
        { userId, grade, feedback }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  // Admin: Menghapus tugas
  deleteAssignment: async (assignmentId, adminId) => {
    try {
      const response = await api.delete(`/assignments/${assignmentId}?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
};

// Users Services (Admin)
export const userService = {
  getAllUsers: async (adminId) => {
    try {
      const response = await api.get(`/users/admin/all?adminId=${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Server error' };
    }
  },
};

export default api;