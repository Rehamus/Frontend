import React, {useState} from 'react';
import axiosInstance from '../../api/axiosInstance';
import styles from './NewNoticePage.module.css';

const NewNoticePage = ({ closeModal }) => {

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('Authorization');

        const noticeData = {
            title,
            body: content,
        };

        try {
            const response = await axiosInstance.post(`/api/admin/post/notice`, noticeData, {
                headers: {
                    Authorization: token,
                }
            });
            if (response.status === 201) {
                closeModal();
            }
        } catch (error) {
            console.error('공지사항 작성 중 오류 발생:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>공지사항 작성</h1>
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
                    <button type="submit" className={styles.button}>공지 작성</button>
                    <button
                        type="button"
                        className={`${styles.button} ${styles['button-secondary']}`}
                        onClick={closeModal}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewNoticePage;
