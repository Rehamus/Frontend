import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './NewPostPage.module.css';

const platformColors = {
    '리디': '#03beea',
    '문피아': '#034889',
    '카카오페이지': '#FFCD00',
    '네이버': '#00C73C'
};

const NewPostReviewPage = () => {
    const { contentId } = useParams();
    const navigate = useNavigate();

    const [content, setContent] = useState(null);
    const [title, setTitle] = useState('');
    const [contentText, setContentText] = useState('');
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
                setGenres(genresArray);
            }, 400); // 0.4초 딜레이
        };

        fetchTagsWithDelay();
    }, []);

    useEffect(() => {
        const fetchContentDetail = async () => {
            try {
                const response = await axiosInstance.get(`/api/contents/${contentId}`, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setContent(response.data);
            } catch (error) {
                console.error('Error fetching content detail:', error);
            }
        };

        fetchContentDetail();
    }, [contentId]);

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
            title: `[ 리뷰 ] ${content.title} :: ${title}`,
            body: contentText,
            contentId,
            prehashtag: '#' + selectedTags.join('#'),
            rating,
        };

        try {
            const response = await axiosInstance.post(`/api/post`, postData, {
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

    if (!content) {
        return <div>Loading...</div>;
    }

    const platformColor = platformColors[content.platform] || '#ccc';

    return (
        <div className={styles.container}>
            <div className={styles.leftColumn}>
                <a href={content.url}>
                    <div className={styles.content_img} style={{ backgroundImage: `url(${content.imgUrl})` }}>
                        <div
                            className={styles.post_platform}
                            style={{ backgroundColor: platformColor }}
                        >
                            {content.platform}
                        </div>
                    </div>
                </a>
                <div className={styles.bookInfo}>
                    <h2>{content.title}</h2>
                    <p>작가: {content.author}</p>
                </div>
            </div>

            <div className={styles.rightColumn}>
                <h1>리뷰 작성</h1>
                <form onSubmit={handleSubmit}>
                    <div className={styles['form-group']}>
                        <label htmlFor="title">제목</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) =>  setTitle(e.target.value)}
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
                            value={contentText}
                            onChange={(e) => setContentText(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className={styles['form-group']}>
                        <button type="submit" className={styles.button} disabled={loading}>글 작성</button>
                        <button
                            type="button"
                            className={`${styles.button} ${styles['button-secondary']}`}
                            onClick={() => navigate(`/community/board/1`)}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewPostReviewPage;
