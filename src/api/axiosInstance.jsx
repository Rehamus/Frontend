import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080', // 배포 시 'https://www.elevenbookshelf.com'으로 변경
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        const isLoggedIn = !!localStorage.getItem('Authorization');

        if (error.response.status === 403 && !originalRequest._retry && isLoggedIn) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('RefreshToken');
                const response = await axios.post('http://localhost:8080/api/auth/refresh', null, {
                    params: {token: refreshToken}
                });

                const {accessToken, refreshToken: newRefreshToken} = response.data;
                localStorage.setItem('Authorization', accessToken);
                localStorage.setItem('RefreshToken', newRefreshToken);

                originalRequest.headers['Authorization'] = `${accessToken}`;
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                alert("세션이 만료되었습니다. 다시 로그인해 주세요.")
                console.error('토큰 갱신 실패:', refreshError);
                localStorage.removeItem('Authorization');
                localStorage.removeItem('RefreshToken');
                localStorage.removeItem('userRole');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;