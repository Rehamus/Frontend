import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminPostManagementPage.module.css';

const AdminPostManagementPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [size] = useState(10); // 페이지 크기
    const [sortBy, setSortBy] = useState('createdAt');
    const [asc, setAsc] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axiosInstance.get('/api/admin/post/page', {
                    params: { page, size, sortBy, asc },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                const data = response.data;
                if (Array.isArray(data)) {
                    setPosts(data);
                } else if (data && data.content) {
                    setPosts(data.content);
                } else {
                    console.error('Unexpected response format:', data);
                    setPosts([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch posts:', error);
                setPosts([]);
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page, size, sortBy, asc]);

    const handleSort = (newSortBy) => {
        if (sortBy === newSortBy) {
            setAsc(!asc);
        } else {
            setSortBy(newSortBy);
            setAsc(true);
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('정말 이 게시물을 삭제하시겠습니까?')) {
            try {
                await axiosInstance.delete(`/api/admin/post/${postId}`, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setPosts(posts.filter(post => post.id !== postId));
                alert('게시물이 삭제되었습니다.');
            } catch (error) {
                console.error('Failed to delete post:', error);
                alert('게시물 삭제에 실패했습니다.');
            }
        }
    };

    const handleRowClick = (boardId, postId) => {
        navigate(`/community/board/${boardId}/post/${postId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>게시글 관리</h2>
            <button onClick={() => navigate('/admin/main')} className={styles.backButton}>메인으로 돌아가기</button>
            <table className={styles.table}>
                <thead>
                <tr>
                    <th onClick={() => handleSort('id')}>ID</th>
                    <th onClick={() => handleSort('userId')}>User ID</th>
                    <th onClick={() => handleSort('postType')}>Post Type</th>
                    <th onClick={() => handleSort('title')}>Title</th>
                    <th onClick={() => handleSort('body')}>Body</th>
                    <th onClick={() => handleSort('nickname')}>Nickname</th>
                    <th onClick={() => handleSort('boardId')}>Board ID</th>
                    <th onClick={() => handleSort('contentId')}>Content ID</th>
                    <th onClick={() => handleSort('createdAt')}>Created At</th>
                    <th onClick={() => handleSort('viewCount')}>View Count</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(posts) && posts.map((post) => (
                    <tr key={post.id} className={styles[`postType-${post.postType}`]} onClick={() => handleRowClick(post.boardId, post.id)}>
                        <td>{post.id}</td>
                        <td>{post.userId}</td>
                        <td>{post.postType}</td>
                        <td>{post.title}</td>
                        <td className={styles.bodyCell}>{post.body}</td>
                        <td>{post.nickname}</td>
                        <td>{post.boardId}</td>
                        <td>{post.contentId}</td>
                        <td>{new Date(post.createdAt).toLocaleString()}</td>
                        <td>{post.viewCount}</td>
                        <td>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }} className={styles.deleteButton}>삭제</button>
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

export default AdminPostManagementPage;
