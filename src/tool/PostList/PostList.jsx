import React from 'react';
import PropTypes from 'prop-types';
import Pagination from '../../tool/Pagination/Pagination';
import './PostList.css';

const PostList = ({ posts, currentPostId, currentPage, totalPages, onPageClick }) => {
    const formatDateTime = (dateTime) => {
        const date = new Date(dateTime);
        const formattedDate = date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        const formattedTime = date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return `${formattedDate} ${formattedTime}`;
    };

    return (
        <div>
            <div className="board-list">
                {posts.map(post => (
                    <a
                        href={`/community/board/${post.boardId}/post/${post.id}`}
                        className={`board-item ${post.id === currentPostId ? 'current-post' : ''}`}
                        key={post.id}
                    >
                        <div className="board-title">
                            <p className={`post_postType ${post.postType}`}>{post.postType}</p> {post.title}
                        </div>
                        <span className="board-meta">
                            {post.nickname} | {formatDateTime(post.createdAt)} | 조회 {post.viewCount}
                        </span>
                    </a>
                ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageClick={onPageClick} />
        </div>
    );
};

PostList.propTypes = {
    posts: PropTypes.array.isRequired,
    currentPostId: PropTypes.string,
    currentPage: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    onPageClick: PropTypes.func.isRequired
};

export default PostList;
