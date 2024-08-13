import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import styles from './AdminLoginPage.module.css';
import axiosInstance from '../../api/axiosInstance';

const AdminLoginPage = ({onAdminLogin}) => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('Authorization', response.data.accessToken);
            localStorage.setItem('RefreshToken', response.data.refreshToken);

            const profileResponse = await axiosInstance.get('/api/user', {
                headers: { Authorization: `${response.data.accessToken}` }
            });

            localStorage.setItem('userRole', profileResponse.data.role);

            onAdminLogin();

            navigate('/admin/main');
        } catch (error) {
            alert('아이디 또는 비밀번호가 정확하지 않습니다. 다시 한 번 확인해 주시기 바랍니다.');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles['login-form']}>
                    <h2>관리자 로그인</h2>
                    <input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles['input-field']}
                        onKeyDown={handleKeyPress}
                    />
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles['input-field']}
                        onKeyDown={handleKeyPress}
                    />
                    <button onClick={handleLogin} className={styles['login-btn']}>로그인</button>
                </div>
            </main>
            <footer className={styles.footer}>
                <p>&copy; 2023 11조 프로젝트. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AdminLoginPage;
