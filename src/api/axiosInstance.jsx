import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_CORS_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(cb) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token) {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
}

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response.status === 403 && !originalRequest._retry) {
            const isLoggedIn = !!localStorage.getItem('Authorization');
            const refreshToken = localStorage.getItem('RefreshToken');

            if (isLoggedIn && refreshToken) {
                originalRequest._retry = true;

                if (!isRefreshing) {
                    isRefreshing = true;

                    try {
                        const response = await axios.post(`${process.env.REACT_APP_CORS_BACKEND_URL}/api/auth/refresh`, null, {
                            params: { token: refreshToken }
                        });

                        const { accessToken, refreshToken: newRefreshToken } = response.data;
                        localStorage.setItem('Authorization', accessToken);
                        localStorage.setItem('RefreshToken', newRefreshToken);

                        isRefreshing = false;
                        onRefreshed(accessToken);

                        originalRequest.headers['Authorization'] = `${accessToken}`;
                        return axiosInstance(originalRequest);
                    } catch (refreshError) {
                        alert("세션이 만료되었습니다. 다시 로그인해 주세요.");
                        console.error('토큰 갱신 실패:', refreshError);
                        localStorage.removeItem('Authorization');
                        localStorage.removeItem('RefreshToken');
                        localStorage.removeItem('userRole');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                } else {
                    return new Promise((resolve) => {
                        subscribeTokenRefresh((token) => {
                            originalRequest.headers['Authorization'] = `${token}`;
                            resolve(axiosInstance(originalRequest));
                        });
                    });
                }
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
