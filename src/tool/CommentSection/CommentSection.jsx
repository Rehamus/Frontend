import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './CommentSection.css';
import { Link } from "react-router-dom";

const CommentSection = ({ postId, isLoggedIn, currentUserId }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [replyContents, setReplyContents] = useState({});
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingContent, setEditingContent] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(3); // 댓글 페이지당 개수

    // useCallback으로 fetchComments 함수를 메모이제이션
    const fetchComments = useCallback(async (page = currentPage - 1) => {
        if (page < 0) page = 0;

        try {
            const response = await axiosInstance.get(`/api/post/${postId}/comments`, {
                params: { page, pagesize: pageSize }
            });
            const commentsData = await Promise.all(response.data.responseDtoList.map(async (comment) => {
                let likeResponse = { data: false };
                if (isLoggedIn) {
                    likeResponse = await axiosInstance.get(`/api/post/${postId}/comments/${comment.id}/like`, {
                        headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                    });
                }

                const children = await Promise.all((comment.children || []).map(async (child) => {
                    let childLikeResponse = { data: false };
                    if (isLoggedIn) {
                        childLikeResponse = await axiosInstance.get(`/api/post/${postId}/comments/${child.id}/like`, {
                            headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                        });
                    }
                    return {
                        ...child,
                        likes: child.likes || 0,
                        likedByUser: childLikeResponse.data || false
                    };
                }));

                return {
                    ...comment,
                    isReplyVisible: false,
                    children,
                    likes: comment.likes || 0,
                    likedByUser: likeResponse.data || false
                };
            }));
            setComments(commentsData);
            setTotalPages(response.data.totalPages);
            setLoading(false);
        } catch (error) {
            console.error("댓글을 불러오는 중 오류가 발생했습니다!", error);
            setLoading(false);
        }
    }, [postId, currentPage, pageSize, isLoggedIn]); // 의존성 배열에 필요한 값들 추가

    useEffect(() => {
        const loadLastPage = async () => {
            const response = await axiosInstance.get(`/api/post/${postId}/comments`, {
                params: { page: 0, pagesize: pageSize }
            });
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.totalPages);
            fetchComments(response.data.totalPages - 1); // 마지막 페이지 댓글 불러오기
        };

        loadLastPage();
    }, [postId, isLoggedIn]);

    useEffect(() => {
        fetchComments(currentPage - 1);
    }, [currentPage]);

    // 댓글 작성 처리 함수
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/api/post/${postId}/comments`, {
                contents: commentContent,
                parentId: null
            }, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            setCurrentPage(totalPages); // 마지막 페이지로 이동
            fetchComments(totalPages - 1);
            setCommentContent('');
        } catch (error) {
            console.error("댓글을 작성하는 중 오류가 발생했습니다!", error);
        }
    };

    const handleReplySubmit = async (e, commentId, parentCommentId = null) => {
        e.preventDefault();
        try {
            await axiosInstance.post(`/api/post/${postId}/comments`, {
                contents: replyContents[commentId] || '',
                parentId: commentId
            }, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            fetchComments(currentPage - 1);  // 현재 페이지에서 댓글 목록 다시 불러오기
            setReplyContents({ ...replyContents, [commentId]: '' });
            setActiveReplyId(null);
        } catch (error) {
            console.error("대댓글을 작성하는 중 오류가 발생했습니다!", error);
        }
    };

    const handleReplyClick = (commentId) => {
        const newActiveReplyId = activeReplyId === commentId ? null : commentId;
        setActiveReplyId(newActiveReplyId);
    };

    const handleReplyContentChange = (e, commentId) => {
        setReplyContents({ ...replyContents, [commentId]: e.target.value });
    };

    const handleEditClick = (commentId, content) => {
        if (editingCommentId === commentId) {
            setEditingCommentId(null);
            setEditingContent('');
        } else {
            setEditingCommentId(commentId);
            setEditingContent(content);
        }
    };

    const handleEditSubmit = async (e, commentId) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/api/post/${postId}/comments/${commentId}`, {
                contents: editingContent
            }, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            fetchComments(currentPage - 1); // 현재 페이지에서 댓글 목록 다시 불러오기
            setEditingCommentId(null);
            setEditingContent('');
        } catch (error) {
            console.error("댓글을 수정하는 중 오류가 발생했습니다!", error);
        }
    };

    const handleDeleteClick = async (commentId) => {
        try {
            await axiosInstance.delete(`/api/post/${postId}/comments/${commentId}`, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            fetchComments(currentPage - 1); // 현재 페이지에서 댓글 목록 다시 불러오기
        } catch (error) {
            console.error("댓글을 삭제하는 중 오류가 발생했습니다!", error);
        }
    };

    const handleLike = async (commentId, liked) => {
        try {
            if (liked) {
                await axiosInstance.delete(`/api/post/${postId}/comments/${commentId}/like`, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
            } else {
                await axiosInstance.post(`/api/post/${postId}/comments/${commentId}/like`, {}, {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
            }
            fetchComments(currentPage - 1); // 현재 페이지에서 댓글 목록 다시 불러오기
        } catch (error) {
            console.error("댓글 작성 중 오류가 발생했습니다!", error);
        }
    };

    // 페이지 변경 처리 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const renderComments = (comments, parentCommentId = null) => {
        return comments.map(comment => {
            const isCurrentUser = comment.userId === parseInt(currentUserId, 10);
            return (
                <div className={`comment ${isCurrentUser ? 'current-user' : ''}`} key={comment.id}>
                    <p className="comment-username">
                        <Link to={`/user/${comment.userId}`}>{comment.nickname}</Link>
                    </p>
                    {editingCommentId === comment.id ? (
                        <form className="update_comment" onSubmit={(e) => handleEditSubmit(e, comment.id)}>
                            <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="edit-textarea"
                            ></textarea>
                            <button type="submit" className="button left_button">수정 완료</button>
                        </form>
                    ) : (
                        <p className="comment-content">{comment.contents}</p>
                    )}
                    <p className="comment-meta"> {comment.createdAt} 좋아요 {comment.likes}</p>
                    {isLoggedIn && (
                        <div className="buttons">
                            <button
                                className="reply-button"
                                onClick={() => handleReplyClick(comment.id)}
                            >
                                답글
                            </button>
                            {isCurrentUser ? (
                                <>
                                    <button
                                        className="edit-button"
                                        onClick={() => handleEditClick(comment.id, comment.contents)}
                                    >
                                        {editingCommentId === comment.id ? '수정 취소' : '수정'}
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() => handleDeleteClick(comment.id)}
                                    >
                                        삭제
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={`reply-button ${comment.likedByUser ? 'liked' : ''}`}
                                    onClick={() => handleLike(comment.id, comment.likedByUser)}
                                >
                                    {comment.likedByUser ? '좋아요 취소' : '좋아요'}
                                </button>
                            )}
                        </div>
                    )}
                    {activeReplyId === comment.id && (
                        <form className="reply-form"
                              onSubmit={(e) => handleReplySubmit(e, comment.id, parentCommentId)}>
                            <textarea
                                name="reply"
                                placeholder="답글을 입력하세요..."
                                value={replyContents[comment.id] || ''}
                                onChange={(e) => handleReplyContentChange(e, comment.id)}
                                className="reply-textarea"
                            ></textarea>
                            <button type="submit" className="button left_button">답글 작성</button>
                        </form>
                    )}
                    {comment.children && comment.children.length > 0 && (
                        <div className="replies">
                            {renderComments(comment.children, comment.id)}
                        </div>
                    )}
                </div>
            );
        });
    };

    if (loading) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className="comment-section">
            <h3>댓글</h3>
            {renderComments(comments)}
            {isLoggedIn && (
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                    <h3>댓글 작성</h3>
                    <textarea
                        name="comment"
                        placeholder="댓글을 입력하세요..."
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="comment-textarea"
                    ></textarea>
                    <button type="submit" className="button left_button">댓글 작성</button>
                </form>
            )}
            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`page-button ${currentPage === i + 1 ? 'active' : ''}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
