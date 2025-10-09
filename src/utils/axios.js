import axios from "axios";
import qs from "qs";

const config = {
  baseURL:
    (import.meta.env.VITE_APP_BASEURL || "http://localhost:1337") + "/api",
  paramsSerializer: {
    serialize: (params) => {
      return qs.stringify(params, {
        encodeValuesOnly: true,
      });
    },
  },
};

const instance = axios.create(config);

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access - redirect to login or show message
      // Only log in development mode
      if (import.meta.env.DEV) {
        console.error("Unauthorized access");
      }
      // TODO: Add proper authentication handling
    }
    return Promise.reject(error);
  }
);

export default instance;
