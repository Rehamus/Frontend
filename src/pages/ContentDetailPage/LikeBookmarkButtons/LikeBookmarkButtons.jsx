import React, {useEffect, useState} from 'react';
import styles from './LikeBookmarkButtons.module.css';
import axiosInstance from '../../../api/axiosInstance';

const LikeBookmarkButtons = ({postId}) => {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
                const response = await axiosInstance.get(`/api/like/${postId}/likesContent`, {headers});
                setLiked(response.data);
            } catch (error) {
                console.error('좋아요 상태를 불러오는 중 에러 발생:', error);
            }
        };

        const fetchBookmarkStatus = async () => {
            try {
                const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
                const userId = localStorage.getItem('userId');
                const response = await axiosInstance.get(`/api/bookmarks/${postId}/status`, {headers, params: {userId}});
                setBookmarked(response.data);
            } catch (error) {
                console.error('북마크 상태를 불러오는 중 에러 발생:', error);
            }
        };

        fetchLikeStatus();
        fetchBookmarkStatus();
    }, [postId]);

    const handleLike = async () => {
        try {
            const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
            if (liked) {
                await axiosInstance.delete(`/api/like/${postId}/likesContent`, {headers});
            } else {
                await axiosInstance.post(`/api/like/${postId}/likesContent`, {}, {headers});
            }
            setLiked(!liked);
        } catch (error) {
            console.error('좋아요 처리 중 에러 발생:', error);
        }
    };

    const handleBookmark = async () => {
        try {
            const headers = {Authorization: `${localStorage.getItem('Authorization')}`};
            if (bookmarked) {
                await axiosInstance.delete(`/api/bookmarks/${postId}`, {headers});
            } else {
                await axiosInstance.post(`/api/bookmarks/${postId}`, {}, {headers});
            }
            setBookmarked(!bookmarked);
        } catch (error) {
            console.error('북마크 처리 중 에러 발생:', error);
        }
    };

    return (
        <div className={styles.buttonContainer}>
            <button className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
                    onClick={handleLike}>
                {liked ? '좋아요 취소' : '좋아요'}
            </button>
            <button className={`${styles.bookmarkButton} ${bookmarked ? styles.bookmarked : ''}`}
                    onClick={handleBookmark}>
                {bookmarked ? '북마크 취소' : '북마크'}
            </button>
        </div>
    );
};

export default LikeBookmarkButtons;
