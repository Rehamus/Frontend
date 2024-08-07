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

        if (error.response) {
            // 에러코드가 3838일 경우 로그아웃 처리
/*            if (error.response.status === 3838) {
                console.error('에러 코드 3838: 로그아웃 처리');
                localStorage.removeItem('Authorization');
                localStorage.removeItem('RefreshToken');
                localStorage.removeItem('userId');
                window.location.href = '/login';
                return Promise.reject(new Error('에러 코드 3838: 로그아웃 처리'));
            }*/

            // 에러코드가 403일 경우 토큰 갱신 처리
            if (error.response.status === 403 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('RefreshToken');
                    const response = await axios.post('http://localhost:8080/api/auth/refresh', null, {
                        params: { token: refreshToken }
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    localStorage.setItem('Authorization', accessToken);
                    localStorage.setItem('RefreshToken', newRefreshToken);

                    originalRequest.headers['Authorization'] = `${accessToken}`;
                    return axiosInstance(originalRequest);
                } catch (refreshError) {
                    console.error('토큰 갱신 실패:', refreshError);
                    localStorage.removeItem('Authorization');
                    localStorage.removeItem('RefreshToken');
                    localStorage.removeItem('userId');
                    // window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
