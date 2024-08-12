import React, {useCallback, useEffect, useState} from 'react';
import axiosInstance from '../../api/axiosInstance';
import './CommentSection.css';

const CommentSection = ({ postId, isLoggedIn, currentUserId }) => {
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState('');
    const [loading, setLoading] = useState(true);
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
    }, [postId, isLoggedIn, pageSize, fetchComments]); // 의존성 배열에 fetchComments, pageSize 추가

    useEffect(() => {
        fetchComments(currentPage - 1);
    }, [currentPage, fetchComments, pageSize]); // 의존성 배열에 fetchComments, pageSize 추가

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
            setCommentContent('');  // 작성 후 입력 필드 비우기
            fetchComments(totalPages - 1);  // 마지막 페이지 댓글 다시 불러오기
        } catch (error) {
            console.error("댓글 작성 중 오류가 발생했습니다!", error);
        }
    };

    // 페이지 변경 처리 함수
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // 댓글을 렌더링하는 함수
    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment">
                <p>{comment.contents}</p>
                {comment.children && renderComments(comment.children)}
            </div>
        ));
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
