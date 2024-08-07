/*
// 배포용
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://www.elevenbookshelf.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
*/

// 로컬용
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;
