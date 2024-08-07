import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './NewPostPage.module.css';

const NewPostPage = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [postType, setPostType] = useState('NORMAL');
    const [content, setContent] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('Authorization');

        const postData = {
            postType,
            title,
            body: content,
            contentId: null,
            rating: null,
        };

        try {
            const response = await axiosInstance.post(`/api/boards/${boardId}/post`, postData, {
                headers: {
                    Authorization: token,
                }
            });
            if (response.status === 201) {
                navigate(`/community/board/${boardId}`);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>새 글 작성</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles['form-group']}>
                    <label htmlFor="title">제목</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className={styles['form-group']}>
                    <label htmlFor="postType">카테고리</label>
                    <select
                        id="postType"
                        name="postType"
                        value={postType}
                        onChange={(e) => setPostType(e.target.value)}
                    >
                        <option value="NORMAL">일반 토론</option>
                    </select>
                </div>
                <div className={styles['form-group']}>
                    <label htmlFor="content">내용</label>
                    <textarea
                        id="content"
                        name="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className={styles['form-group']}>
                    <button type="submit" className={styles.button}>글 작성</button>
                    <button
                        type="button"
                        className={`${styles.button} ${styles['button-secondary']}`}
                        onClick={() => navigate(`/community/board/${boardId}`)}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPostPage;
