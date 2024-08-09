import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminUserManagementPage.module.css';

const AdminUserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // 페이지 크기
    const [sortBy, setSortBy] = useState('createdAt');
    const [asc, setAsc] = useState(true);
    const navigate = useNavigate();

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
                } else if (data && data.content) {
                    setUsers(data.content);
                } else {
                    console.error('Unexpected response format:', data);
                    setUsers([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch users:', error);
                setUsers([]);
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

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setAsc(!asc); // 동일한 열 클릭 시 정렬 순서 변경
        } else {
            setSortBy(newSortBy);
            setAsc(true); // 다른 열을 클릭 시 오름차순으로 시작
        }
    };

    const getSortIndicator = (column) => {
        if (sortBy === column) {
            return asc ? ' ▲' : ' ▼';  // 오름차순은 ▲, 내림차순은 ▼
        }
        return '';
    };

    const handleRowClick = (userId) => {
        navigate(`/user/${userId}`);
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
                    <th onClick={() => handleSort('id')}>
                        ID{getSortIndicator('id')}
                    </th>
                    <th onClick={() => handleSort('nickname')}>
                        닉네임{getSortIndicator('nickname')}
                    </th>
                    <th onClick={() => handleSort('email')}>
                        이메일{getSortIndicator('email')}
                    </th>
                    <th>상태</th>
                    <th onClick={() => handleSort('role')}>
                        권한{getSortIndicator('role')}
                    </th>
                    <th onClick={() => handleSort('createdAt')}>
                        가입일자{getSortIndicator('createdAt')}
                    </th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(users) && users.map((user) => (
                    <tr key={user.id} onClick={() => handleRowClick(user.id)} className={styles.row}>
                        <td>{user.id}</td>
                        <td>{user.nickname}</td>
                        <td>{user.email}</td>
                        <td>
                            <select
                                value={user.status}
                                onChange={(e) => handleStatusChange(user.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
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
