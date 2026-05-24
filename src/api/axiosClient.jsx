import axios from 'axios';

const axiosClient = axios.create({
  baseURL: '/api/v1/catalog',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error.response?.data);
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;