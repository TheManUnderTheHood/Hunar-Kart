import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: baseURL,
    withCredentials: true,
});

// A flag to prevent an infinite loop of refresh calls
let isRefreshing = false;
// A queue to hold all the requests that failed due to 401
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// We create a setup function that can be called from a React component
// This allows the interceptor to have access to context like a logout function
export const setupInterceptors = (authContext) => {

    apiClient.interceptors.response.use(
        (response) => {
            // Any status code that lie within the range of 2xx cause this function to trigger
            return response;
        },
        async (error) => {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            const originalRequest = error.config;

            // Check if the error is 401 Unauthorized and it's not a retry request
            if (error.response?.status === 401 && !originalRequest._retry) {
                
                // If a refresh is already in progress, we'll queue this request
                if (isRefreshing) {
                    return new Promise(function(resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        // The original request is retried when the token is refreshed
                        return apiClient(originalRequest);
                    });
                }
                
                // Mark this request as a retry
                originalRequest._retry = true;
                isRefreshing = true;
                
                try {
                    // Attempt to refresh the token
                    await apiClient.post('/adminoperator/refresh-token');
                    
                    // Token refresh was successful, process the queue with no error
                    processQueue(null);
                    
                    // Retry the original request that failed
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    // If the refresh token attempt fails, it means the user's session is invalid
                    processQueue(refreshError, null);
                    
                    // Use the logout function passed from the auth context
                    authContext.logout(); 
                    
                    // Reject the promise to prevent the original component from proceeding
                    return Promise.reject(refreshError);
                } finally {
                    // Reset the refreshing flag
                    isRefreshing = false;
                }
            }
            
            // For any other errors (not 401), just pass them along
            return Promise.reject(error);
        }
    );
};


export default apiClient;