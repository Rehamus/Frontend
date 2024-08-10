import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminMainPage.module.css';
import axiosInstance from '../../api/axiosInstance';

const AdminMainPage = ({ onAdminLogin }) => {
    const navigate = useNavigate();
    const backendUrl = axiosInstance.defaults.baseURL;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSocialLogin = (provider) => {
        window.location.href = `${backendUrl}/oauth2/authorization/${provider}`;
    };

    const handleLogin = async () => {
        try {
            const response = await axiosInstance.post('/api/auth/login', {
                username,
                password
            });
            localStorage.setItem('Authorization', response.data.accessToken);
            localStorage.setItem('RefreshToken', response.data.refreshToken);
            onAdminLogin();

            navigate('/admin/main');
        } catch (error) {
            alert('Invalid username or password');
        }
    };

    const handleCrawlingAction = async (endpoint) => {
        try {
            await axiosInstance.post(`/api/content${endpoint}`,
                {},{ headers: { Authorization: `${localStorage.getItem('Authorization')}`}}
        );
            alert('작업이 성공적으로 완료되었습니다.');
        } catch (error) {
            alert('작업 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles['crawling-form']}>
                    <h2>크롤링 관리</h2>
                    <div className={styles['crawling-btn-container']}>
                        <button onClick={() => handleCrawlingAction('/start/all')}
                                className={styles['crawling-btn']}>전체 크롤링 시작
                        </button>
                        <button onClick={() => handleCrawlingAction('/local')}
                                className={styles['crawling-btn']}>로컬 파일로 저장
                        </button>
                        <button onClick={() => handleCrawlingAction('/local/update')}
                                className={styles['crawling-btn']}>로컬 파일로 DB 업데이트
                        </button>
                    </div>
                    <br/>
                    <h2>관리</h2>
                    <div className={styles['management-btn-container']}>
                        <button onClick={() => navigate('/admin/user')}
                                className={styles['management-btn']}>유저 관리
                        </button>
                        <button onClick={() => navigate('/admin/post')}
                                className={styles['management-btn']}>게시글 관리
                        </button>
                        <button onClick={() => navigate('/admin/content')}
                                className={styles['management-btn']}>컨텐츠 관리
                        </button>
                        <button onClick={() => navigate('/admin/hashtag')}
                                className={styles['management-btn']}>태그 관리
                        </button>
                        <button onClick={() => navigate('/admin/other')}
                                className={styles['management-btn']}>기타 관리
                        </button>
                    </div>
                </div>
                <div className={styles['login-form']}>

                </div>
                <div className={styles['login-form']}>
                    <h2>공지사항 관리</h2>
                    <div className={styles['crawling-btn-container']}>
                        <button
                                className={styles['crawling-btn']}> 공지 쓰기
                        </button>
                        <button
                                className={styles['crawling-btn']}> 공지 쓰기
                        </button>
                        <button
                                className={styles['crawling-btn']}> 공지 쓰기
                        </button>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>&copy; 2023 11조 프로젝트. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AdminMainPage;
