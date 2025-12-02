import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
    timeout: 10000, // 10 seconds timeout
});

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
    (response) => {
        // Success response - pass through
        return response;
    },
    (error) => {
        // Error handling
        const status = error.response?.status;

        // 401: Unauthorized - Session expired
        if (status === 401) {
            console.error('🔒 401 Unauthorized - Session expired');

            // Clear all auth data
            localStorage.clear();

            // Show toast message (if toast system available)
            if (window.showToast) {
                window.showToast('Sesi Anda telah berakhir. Silakan login kembali.', 'error');
            }

            // Redirect to login
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }

        // 500: Server Error
        if (status === 500) {
            console.error('⚠️ 500 Server Error');
            if (window.showToast) {
                window.showToast('Server sedang sibuk. Silakan coba lagi sesaat.', 'error');
            }
        }

        // Network Error (Offline)
        if (error.message === 'Network Error' || !navigator.onLine) {
            console.error('📡 Network Error - Offline');
            if (window.showToast) {
                window.showToast('Anda sedang offline. Periksa koneksi internet.', 'warning');
            }
        }

        // Timeout Error
        if (error.code === 'ECONNABORTED') {
            console.error('⏱️ Request Timeout');
            if (window.showToast) {
                window.showToast('Koneksi lambat. Silakan coba lagi.', 'warning');
            }
        }

        // Reject the error
        return Promise.reject(error);
    }
);

// Request Interceptor (Optional - for adding auth tokens)
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

// Extend Window interface for TypeScript
declare global {
    interface Window {
        showToast?: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
    }
}
