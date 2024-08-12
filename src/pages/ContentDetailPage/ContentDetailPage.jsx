import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import CommentSection from '../../tool/CommentSection/CommentSection';
import LikeBookmarkButtons from './LikeBookmarkButtons/LikeBookmarkButtons';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import styles from './ContentDetailPage.module.css';

const platformColors = {
    '리디': '#03beea',
    '문피아': '#034889',
    '카카오페이지': '#FFCD00',
    '네이버': '#00C73C'
};

const ContentDetailPage = ({ isLoggedIn }) => {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [currentUserId, setCurrentUserId] = useState(null);
    const itemsPerPage = 4; // 페이지당 아이템 수

    useEffect(() => {
        const fetchContentDetail = async () => {
            try {
                const response = await axiosInstance.get(`/api/contents/${cardId}`,{
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setContent(response.data);
                console.log(response.data)

                setTotalPages(Math.ceil(response.data.posts.length / itemsPerPage));
                await axiosInstance.post(`/api/contents/viewcount/${cardId}`);
            } catch (error) {
                console.error('Error fetching content detail:', error);
            }
        };

        fetchContentDetail();
    }, [cardId]);

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axiosInstance.get('/api/user', {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                setCurrentUserId(response.data.id);
            } catch (error) {
                console.error("사용자 정보를 가져오는 중 오류가 발생했습니다!", error);
            }
        };

        if (isLoggedIn) {
            fetchCurrentUser();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            try {
                const response = await axiosInstance.get(`/api/post/list`, {
                    params: {
                        postType: 'REVIEW',
                        page: page - 1,
                        pagesize: itemsPerPage,
                        asc: false
                    }
                });
                setRelatedPosts(response.data.responseDtoList);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("There was an error fetching related posts!", error);
            }
        };

        fetchRelatedPosts();
    }, [page]);

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
    };

    if (!content) {
        return <div>Loading...</div>;
    }

    const platformColor = platformColors[content.platform] || '#ccc';

    return (
        <div className={styles.container}>
            <div className={styles.postDetail}>
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
                        <a href={content.url}>
                            <div className={styles.detail_button}>
                                보러가기
                            </div>
                        </a>
                        {isLoggedIn && (
                            <div className={styles.detail_button} onClick={() => navigate(`/review/${cardId}/new`)}>
                                리뷰 쓰기
                            </div>
                        )}
                    </div>
                </div>
                <div className={styles.rightColumn}>
                    <div className={styles.topBox}>
                        {isLoggedIn && <LikeBookmarkButtons postId={cardId} />}
                        <h2 className={styles.postDetailTitle}>{content.title}</h2>
                        {content.contentHashTag && (
                            <div className={styles.tag_container}>
                                {content.contentHashTag.split('#').filter(tag => tag.trim() !== '').map((tag, index) => (
                                    <button key={index} className={styles.tag_button}>{tag}</button>
                                ))}
                            </div>
                        )}
                        <p className={styles.postDetailMeta}>작가: {content.author} | {content.date}</p>
                        <div className={styles.tag_container}>
                            {content.hashtags && content.hashtags.map(tag => (
                                <button key={tag} className={styles.tag_button}>{tag}</button>
                            ))}
                        </div>
                        <div className={styles.postDetailContent}>
                            <p>{content.description}</p>
                        </div>
                    </div>
                    <div className="commentSection">
                        <CommentSection postId={cardId} isLoggedIn={isLoggedIn} currentUserId={currentUserId} />
                    </div>
                </div>
            </div>

            <div className={styles.review_container}>
                <div className="community-header review_head">
                    <a href={`/community/board/2`}><h2 className="review_head">리뷰 보드</h2></a>
                </div>

                <PostList
                    posts={relatedPosts}
                    boardId={2}  // 리뷰 보드 ID
                    currentPostId={null}
                    currentPage={page}
                    totalPages={totalPages}
                    onPageClick={handlePageClick}
                />
            </div>
        </div>
    );
};

export default ContentDetailPage;
