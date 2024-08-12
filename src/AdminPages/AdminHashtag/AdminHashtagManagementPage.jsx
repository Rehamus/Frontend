import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminHashtagManagementPage.module.css';

const AdminHashtagManagementPage = () => {
    const [hashtags, setHashtags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [sortBy, setSortBy] = useState('id');
    const [asc, setAsc] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setPage(0);
        setSortBy('id');
        setAsc(true);
    }, []);

    useEffect(() => {
        const fetchHashtags = async () => {
            try {
                const response = await axiosInstance.get('/api/admin/hashtag/page', {
                    params: { page, size, sortBy, asc },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                const data = response.data;
                if (Array.isArray(data)) {
                    setHashtags(data);
                } else if (data && data.content) {
                    setHashtags(data.content);
                } else {
                    console.error('Unexpected response format:', data);
                    setHashtags([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch hashtags:', error);
                setHashtags([]);
                setLoading(false);
            }
        };

        fetchHashtags();
    }, [page, sortBy, size, asc]);

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setAsc(!asc);
        } else {
            setSortBy(newSortBy);
            setAsc(true);
        }
    };

    const getSortIndicator = (column) => {
        if (sortBy === column) {
            return asc ? ' ▲' : ' ▼';
        }
        return '';
    };

    const handleDelete = async (hashtagId) => {
        if (window.confirm('정말 이 해시태그를 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/api/admin/hashtag/${hashtagId}`, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setHashtags(hashtags.filter(hashtag => hashtag.id !== hashtagId));
                alert('해시태그가 삭제되었습니다.');
            } catch (error) {
                console.error('Failed to delete hashtag:', error);
                alert('해시태그 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>해시태그 관리</h2>
            <button onClick={() => navigate('/admin/main')} className={styles.backButton}>메인으로 돌아가기</button>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th onClick={() => handleSort('id')}>
                        ID{getSortIndicator('id')}
                    </th>
                    <th onClick={() => handleSort('tier')}>
                        Tier{getSortIndicator('tier')}
                    </th>
                    <th onClick={() => handleSort('tag')}>
                        Tag{getSortIndicator('tag')}
                    </th>
                    <th onClick={() => handleSort('count')}>
                        Count{getSortIndicator('count')}
                    </th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(hashtags) && hashtags.map((hashtag) => (
                    <tr key={hashtag.id}>
                        <td>{hashtag.id}</td>
                        <td>{hashtag.tier}</td>
                        <td>{hashtag.tag}</td>
                        <td>{hashtag.count}</td>
                        <td>
                            <button onClick={() => handleDelete(hashtag.id)} className={styles.deleteButton}>삭제</button>
                        </td>
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

export default AdminHashtagManagementPage;
