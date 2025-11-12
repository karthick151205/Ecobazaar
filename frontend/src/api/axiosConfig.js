import axios from 'axios';

// Create an Axios instance with default configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // Your backend API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      // If token exists, add it to the Authorization header
      // Ensure the format is "Bearer <token>"
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Return the modified config
  },
  error => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for handling common errors like 401
apiClient.interceptors.response.use(
  response => {
    // If the response is successful, just return it
    return response;
  },
  error => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Optional: Clear token and redirect to login
      console.error("Unauthorized request - 401:", error.response);
      localStorage.removeItem('token'); // Clear invalid token
      // Redirect to login page - you might need access to navigate or use window.location
      // window.location.href = '/login'; // Simple redirect
    }
    // Return the error to be handled by the component's catch block
    return Promise.reject(error);
  }
);


export default apiClient;
