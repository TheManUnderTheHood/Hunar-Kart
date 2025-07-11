import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL;

const apiClient = axios.create({
    baseURL: baseURL,
    withCredentials: true, 
});

console.log("API Client is configured to use baseURL:", baseURL);


export default apiClient;