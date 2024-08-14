import React, {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import CommentSection from '../../tool/CommentSection/CommentSection';
import PostList from '../../tool/PostList/PostList';
import './PostDetailPage.css';
import styles from '../ContentDetailPage/ContentDetailPage.module.css';

const platformColors = {
    '리디': '#03beea',
    '문피아': '#034889',
    '카카오페이지': '#FFCD00',
    '네이버': '#00C73C'
};

const PostDetailPage = ({isLoggedIn}) => {
    const {boardId, postId} = useParams();
    const [post, setPost] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liked, setLiked] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedContent, setEditedContent] = useState('');
    const [contentId, setContentId] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    // Determine post type based on boardId
    const postType = boardId === '1' ? 'REVIEW' : 'NORMAL';

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axiosInstance.get(`/api/post/${postId}`);
                const postData = response.data;
                setPost(postData);
                setEditedTitle(postData.title);
                setEditedContent(postData.body);
                setContentId(postData.contentId); // contentId 설정
                setLoading(false);
            } catch (error) {
                console.error("There was an error fetching the post!", error);
                setLoading(false);
            }
        };

        fetchPost();
    }, [boardId, postId]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (isLoggedIn) {
                try {
                    const response = await axiosInstance.get(`/api/user`, {
                        headers: {Authorization: `${localStorage.getItem('Authorization')}`}
                    });
                    setUserProfile(response.data); // 유저 프로필 상태 설정
                } catch (error) {
                    console.error("There was an error fetching the user profile!", error);
                }
            }
        };

        fetchUserProfile();
    }, [isLoggedIn]);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const response = await axiosInstance.get(`/api/post/${postId}/like`, {
                    headers: {Authorization: `${localStorage.getItem('Authorization')}`}
                });
                setLiked(response.data);
            } catch (error) {
                console.error("There was an error fetching the like status!", error);
            }
        };

        if (isLoggedIn) {
            fetchLikeStatus();
        }
    }, [postId, isLoggedIn]);

    useEffect(() => {
        const fetchContentDetail = async () => {
            if (contentId) {
                try {
                    const response = await axiosInstance.get(`/api/contents/${contentId}`);
                    setContent(response.data);
                    await axiosInstance.post(`/api/contents/viewcount/${contentId}`);
                } catch (error) {
                    console.error('Error fetching content detail:', error);
                }
            }
        };

        fetchContentDetail();
    }, [contentId]);

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            try {
                const response = await axiosInstance.get('/api/post/list', {
                    params: {postType, page: currentPage - 1, pagesize: 5, asc: true}
                });
                setRelatedPosts(response.data.responseDtoList);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error("There was an error fetching related posts!", error);
            }
        };

        fetchRelatedPosts();
    }, [boardId, currentPage, postType]);

    const handleLikeButtonClick = async () => {
        const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
        try {
            if (liked) {
                await axiosInstance.delete(`/api/post/${postId}/like`, {headers});
            } else {
                await axiosInstance.post(`/api/post/${postId}/like`, {}, {headers});
            }
            setLiked(!liked);
        } catch (error) {
            console.error("There was an error updating the like status!", error);
        }
    };

    const handleDelete = async () => {
        const headers = { Authorization: `${localStorage.getItem('Authorization')}` };
        try {
            await axiosInstance.delete(`/api/post/${postId}`, { headers });
            navigate('/');
        } catch (error) {
            console.error("There was an error deleting the post!", error);
        }
    };

    const handleEdit = () => {
        setEditMode(true);
    };

    const handleSave = async () => {
        if (!editedTitle.trim()) {
            alert('제목은 반드시 입력해야 합니다.');
            return;
        }

        const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
        try {
            await axiosInstance.put(`/api/post/${postId}`, {
                title: editedTitle,
                body: editedContent
            }, {headers});
            setPost({...post, title: editedTitle, body: editedContent});
            setEditMode(false);
        } catch (error) {
            console.error("There was an error saving the post!", error);
        }
    };

    const handleTagClick = (tag) => {
        localStorage.setItem('selectedTag', tag);  // 선택된 태그를 로컬 스토리지에 저장
        console.log(tag)
        navigate('/');  // '/' 경로로 리다이렉트
    };

    const handlePageClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!post) {
        return <div>Post not found</div>;
    }

    const platformColor = content && content.platform ? platformColors[content.platform] || '#ccc' : '#ccc';

    return (
        <div className="container">
            <div className="back-button">
                <a href={`/community/board/${boardId}`} className="post button"><h3>뒤로</h3></a>
            </div>
            <div className={`post-detail-container ${post.postType === "REVIEW" ? "review" : ""}`}>
                {post.postType === "REVIEW" && content && (
                    <div className={styles.post_img} style={{backgroundImage: `url(${content.imgUrl})`}}>
                        <div
                            className={styles.post_platform}
                            style={{backgroundColor: platformColor}}
                        >
                            {content.platform}
                        </div>
                    </div>
                )}
                <div className="post-detail">
                    {post.postType === "REVIEW" && content && (
                        <div className="post-detail_2">
                            <div className={styles.button_container}>
                                <h2 className={styles.contentDetailTitle}>{content.title}</h2>
                                <div className={styles.content_detail_buttons}>
                                    <a href={content.url}>
                                        <div className={styles.content_detail_button}>
                                            보러가기
                                        </div>
                                    </a>
                                    <a href={`/content/${content.id}`}>
                                        <div className={styles.content_detail_button}>
                                            상세페이지
                                        </div>
                                    </a>
                                </div>
                            </div>
                            {content.contentHashTag && (
                                <div className={styles.tag_container}>
                                    {content.contentHashTag.split('#').filter(tag => tag.trim() !== '').map((tag, index) => (
                                        <button onClick={() => handleTagClick(tag)}
                                         key={index} className={styles.tag_button} >{tag}</button>
                                    ))}
                                </div>
                            )}
                            <p className={styles.contentDetailMeta}>작가: {content.author} </p>
                            <div className={styles.postDetailContent}>
                                <p>{content.description}</p>
                            </div>
                        </div>
                    )}
                    <div className="post-detail_3">
                        {isLoggedIn && userProfile && userProfile.id !== post.userId && (
                            <button
                                className={`post-like-button ${liked ? 'liked' : ''}`}
                                onClick={handleLikeButtonClick}
                            >
                                {liked ? '좋아요 취소' : '좋아요'}
                            </button>
                        )}
                        <div className="post-detail-header">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="post-edit-title"
                                />
                            ) : (
                                <h2 className="post-detail-title">{post.title}</h2>
                            )}
                        </div>
                        <p className="post-detail-meta"><Link
                            to={`/user/${post.userId}`}>작성자: {post.nickname}</Link> | {post.createdAt}</p>
                        <div className="post-detail-content">
                            {editMode ? (
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="post-edit-textarea"
                                />
                            ) : (
                                <p>{post.body}</p>
                            )}
                        </div>
                        {isLoggedIn && userProfile && userProfile.id === post.userId && (
                            <div className="post-actions">
                                {editMode ? (
                                    <button className="post-save-button" onClick={handleSave}>저장</button>
                                ) : (
                                    <>
                                        <button className="post-edit-button" onClick={handleEdit}>수정</button>
                                        <button className="post-delete-button" onClick={handleDelete}>삭제</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <CommentSection postId={postId} isLoggedIn={isLoggedIn} currentUserId={userProfile ? userProfile.id : null} />
            <div className="related-posts">
                <h3>관련 포스트</h3>
                <PostList
                    posts={relatedPosts}
                    boardId={boardId}
                    currentPostId={postId}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageClick={handlePageClick}
                />
            </div>
        </div>
    );
}

export default PostDetailPage;
