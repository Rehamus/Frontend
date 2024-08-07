import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './NewPostPage.module.css';

const NewPostReviewPage = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [genres, setGenres] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTagsWithDelay = () => {
            setTimeout(() => {
                const storedTags = localStorage.getItem('tags');
                const genresArray = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];
                console.log("Stored Tags:", storedTags);
                console.log("Genres Array:", genresArray);
                setGenres(genresArray);
            }, 400); // 0.4초 딜레이
        };

        fetchTagsWithDelay();
    }, []);

    const handleTagClick = (tag) => {
        setSelectedTags(prevSelectedTags => {
            if (prevSelectedTags.includes(tag)) {
                return prevSelectedTags.filter(t => t !== tag);
            } else {
                return [...prevSelectedTags, tag];
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const token = localStorage.getItem('Authorization');

        const postData = {
            postType: 'REVIEW',
            title,
            body: content,
            contentId,
            prehashtag: selectedTags.join('#'),
            rating,
        };

        try {
            const response = await axiosInstance.post(`/api/boards/2/post`, postData, {
                headers: {
                    Authorization: token,
                }
            });
            if (response.status === 201) {
                navigate(`/content/${contentId}`);
            }

        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);  // 로딩 상태 해제
        }
    };

    const filteredGenres = genres.filter(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className={styles.container}>
            <h1>리뷰 작성</h1>
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
                    <label htmlFor="rating">별점</label>
                    <select
                        id="rating"
                        name="rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        required
                    >
                        <option value="0">💢💔🥱</option>
                        <option value="1">⭐</option>
                        <option value="2">⭐⭐</option>
                        <option value="3">⭐⭐⭐</option>
                        <option value="4">⭐⭐⭐⭐</option>
                        <option value="5">⭐⭐⭐⭐⭐</option>
                    </select>
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="tag-search">태그 검색</label>
                    <input
                        type="text"
                        id="tag-search"
                        name="tag-search"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
                {selectedTags.length > 0 && (
                    <div className={styles['selected-tag-container']}>
                        <label>선택된 태그:</label>
                        <div>
                            {selectedTags.map(tag => (
                                <span
                                    key={tag}
                                    className={styles['selected-tag']}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                {searchTerm && filteredGenres.length > 0 && (
                    <div className={styles['form-group']}>
                        <label>태그 선택</label>
                        <div className={styles['tag-container']}>
                            {filteredGenres.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`${styles.tag} ${selectedTags.includes(tag) ? styles['tag-selected'] : ''}`}
                                    onClick={() => handleTagClick(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                    <button type="submit" className={styles.button} disabled={loading}>글 작성</button>
                    <button
                        type="button"
                        className={`${styles.button} ${styles['button-secondary']}`}
                        onClick={() => navigate(`/content/${contentId}`)}
                    >
                        취소
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NewPostReviewPage;
