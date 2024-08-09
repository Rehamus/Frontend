import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminUserManagementPage.module.css';

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // 페이지 크기
    const [sortBy] = useState('createdAt');
    const [asc] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get('/api/admin/user/page', {
                    params: { page, size, sortBy, asc },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                const data = response.data;
                if (Array.isArray(data)) {
                    setUsers(data);
                } else if (data && data.content) { // 예를 들어, 데이터가 객체 안에 content 필드로 포함된 경우
                    setUsers(data.content);
                } else {
                    console.error('Unexpected response format:', data);
                    setUsers([]); // 예상치 못한 형식인 경우 빈 배열로 설정
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setUsers([]); // 에러 발생 시 빈 배열로 설정
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page, size, sortBy, asc]);

    const handleStatusChange = async (userId, newStatus) => {
        try {
            await axiosInstance.patch(`/api/admin/user/${userId}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            setUsers(users.map(user => user.id === userId ? { ...user, status: newStatus } : user));
            alert('유저 상태변경에 성공했습니다.');
        } catch (error) {
            console.error('유저 상태변경에 실패했습니다.', error);
            alert('유저 상태변경에 실패했습니다.');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>유저 관리</h2>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>닉네임</th>
                    <th>이메일</th>
                    <th>상태</th>
                    <th>권한</th>
                    <th>가입일자</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(users) && users.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.nickname}</td>
                        <td>{user.email}</td>
                        <td>
                            <select
                                value={user.status}
                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                className={styles.statusSelect}
                            >
                                <option value="NORMAL">NORMAL</option>
                                <option value="DELETED">DELETED</option>
                                <option value="BLOCKED">BLOCKED</option>
                            </select>
                        </td>
                        <td>{user.role}</td>
                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className={styles.pagination}>
                <button onClick={() => setPage(page - 1)} disabled={page === 0}>
                    Previous
                </button>
                <button onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminUserManagementPage;
