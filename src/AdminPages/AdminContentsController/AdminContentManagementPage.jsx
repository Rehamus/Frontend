import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminContentManagementPage.module.css';

const AdminContentManagementPage = () => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(8);
    const [sortBy, setSortBy] = useState('id');
    const [asc, setAsc] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        setPage(0);
        setSortBy('id');
        setAsc(true);
    }, []);

    useEffect(() => {
        const fetchContents = async () => {
            try {
                const response = await axiosInstance.get('/api/admin/contents/page', {
                    params: { page, size, sortBy, asc },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                const data = response.data;
                if (Array.isArray(data)) {
                    setContents(data);
                } else if (data && data.content) {
                    setContents(data.content);
                } else {
                    console.error('Unexpected response format:', data);
                    setContents([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch contents:', error);
                setContents([]);
                setLoading(false);
            }
        };

        fetchContents();
    }, [page, sortBy,size, asc]);

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
            return asc ? ' ▲' : ' ▼'; // 오름차순은 ▲, 내림차순은 ▼
        }
        return '';
    };

    const handleDelete = async (contentId) => {
        if (window.confirm('정말 이 컨텐츠를 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/api/admin/contents/${contentId}`, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setContents(contents.filter(content => content.id !== contentId));
                alert('컨텐츠가 삭제되었습니다.');
            } catch (error) {
                console.error('Failed to delete content:', error);
                alert('컨텐츠 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>컨텐츠 관리</h2>
            <button onClick={() => navigate('/admin/main')} className={styles.backButton}>메인으로 돌아가기</button>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th onClick={() => handleSort('id')}>
                        ID{getSortIndicator('id')}
                    </th>
                    <th onClick={() => handleSort('title')}>
                        제목{getSortIndicator('title')}
                    </th>
                    <th onClick={() => handleSort('author')}>
                        저자{getSortIndicator('author')}
                    </th>
                    <th onClick={() => handleSort('platform')}>
                        플랫폼{getSortIndicator('platform')}
                    </th>
                    <th onClick={() => handleSort('genre')}>
                        장르{getSortIndicator('genre')}
                    </th>
                    <th onClick={() => handleSort('view')}>
                        조회수{getSortIndicator('view')}
                    </th>
                    <th onClick={() => handleSort('rating')}>
                        평점{getSortIndicator('rating')}
                    </th>
                    <th onClick={() => handleSort('bookMarkCount')}>
                        북마크 수{getSortIndicator('bookMarkCount')}
                    </th>
                    <th onClick={() => handleSort('likeCount')}>
                        좋아요 수{getSortIndicator('likeCount')}
                    </th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(contents) && contents.map((content) => (
                    <tr key={content.id} className={styles.row}>
                        <td>{content.id}</td>
                        <td>{content.title}</td>
                        <td>{content.author}</td>
                        <td>{content.platform}</td>
                        <td>{content.genre}</td>
                        <td>{content.view}</td>
                        <td>{content.rating}</td>
                        <td>{content.bookMarkCount}</td>
                        <td>{content.likeCount}</td>
                        <td>
                            <button
                                onClick={() => handleDelete(content.id)}
                                className={styles.deleteButton}
                            >
                                삭제
                            </button>
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

export default AdminContentManagementPage;
