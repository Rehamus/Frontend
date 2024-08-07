import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentSection from '../../tool/CommentSection/CommentSection';
import LikeBookmarkButtons from './LikeBookmarkButtons/LikeBookmarkButtons';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import Pagination from '../../tool/Pagination/Pagination';
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
    const [post, setPost] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 4; // 페이지당 아이템 수

    useEffect(() => {
        const fetchContentDetail = async () => {
            try {
                const response = await axiosInstance.get(`/api/contents/${cardId}`);
                setPost(response.data);
                setTotalPages(Math.ceil(response.data.posts.length / itemsPerPage));
                await axiosInstance.post(`/api/contents/viewcount/${cardId}`);
            } catch (error) {
                console.error('Error fetching content detail:', error);
            }
        };

        fetchContentDetail();
    }, [cardId]);

    const handlePageClick = (page) => {
        setPage(page);
    };

    if (!post) {
        return <div>Loading...</div>;
    }

    const platformColor = platformColors[post.platform] || '#ccc';
    const boardId = 2;

    const paginatedPosts = post.posts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
        <div className={styles.container}>
            <div className={styles.postDetail}>
                <div className={styles.leftColumn}>
                    <a href={post.url}>
                        <div className={styles.content_img} style={{ backgroundImage: `url(${post.imgUrl})` }}>
                            <div
                                className={styles.post_platform}
                                style={{ backgroundColor: platformColor }}
                            >
                                {post.platform}
                            </div>
                        </div>
                    </a>
                    <div className={styles.bookInfo}>
                        <h2>{post.title}</h2>
                        <p>제작 작화: {post.author}</p>
                        <a href={post.url}>
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
                        {isLoggedIn && <LikeBookmarkButtons postId={cardId}/>}
                        <h2 className={styles.postDetailTitle}>{post.title}</h2>
                        <p className={styles.postDetailMeta}>제작 작화: {post.author} | {post.date}</p>
                        <div className={styles.tag_container}>
                            {post.hashtags && post.hashtags.map(tag => (
                                <button key={tag} className={styles.tag_button}>{tag}</button>
                            ))}
                        </div>
                        <div className={styles.postDetailContent}>
                            <p>{post.description}</p>
                        </div>
                    </div>
                    <div className='commentSection'>
                        <CommentSection postId={cardId} isLoggedIn={isLoggedIn}/>
                    </div>
                </div>
            </div>

            <div className={styles.review_container}>
                <div className="community-header review_head">
                    <a href={`/community/board/2`}><h2 className="review_head" >리뷰 보드</h2></a>
                </div>

                <PostList
                    posts={paginatedPosts}
                    boardId={boardId}
                    currentPage={page}
                    totalPages={totalPages}
                    onPageClick={handlePageClick}
                />
            </div>
        </div>
    );
};

export default ContentDetailPage;
