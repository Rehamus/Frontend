import React, {useEffect, useState} from 'react';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import styles from './CommunityPage.module.css';

const CommunityPage = () => {
    const [reviewPosts, setReviewPosts] = useState([]);
    const [normalPosts, setNormalPosts] = useState([]);
    const [noticePosts, setNoticePosts] = useState([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const noticeResponse = await axiosInstance.get(`/api/post/list`, {
                    params: {postType: 'NOTICE', page: 0, pagesize: 3, asc: false}
                });
                setNoticePosts(noticeResponse.data.responseDtoList);

                const reviewResponse = await axiosInstance.get(`/api/post/list`, {
                    params: {postType: 'REVIEW', page: 0, pagesize: 3, asc: true}
                });
                setReviewPosts(reviewResponse.data.responseDtoList);

                const normalResponse = await axiosInstance.get(`/api/post/list`, {
                    params: {postType: 'NORMAL', page: 0, pagesize: 3, asc: true}
                });
                setNormalPosts(normalResponse.data.responseDtoList);
            } catch (error) {
                console.error("There was an error fetching the posts!", error);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className={styles.c_container}>
            <div className={styles.communityHeader}>
                <h1>커뮤니티</h1>
            </div>
            <div className={styles.boardItem}>
                <div className={styles.Posts}>
                    <h2 className={styles.postT}>공지글</h2>
                    <PostList posts={noticePosts} boardId={0}/>
                </div>
            </div>

            <div className={styles.boardItem}>
                <div className={styles.Posts}>
                    <a href={'/community/board/1'}>
                        <h2 className={styles.postT}>리뷰 게시글</h2></a>
                    <PostList posts={reviewPosts} boardId={1}/>
                </div>
            </div>

            <div className={styles.boardItem}>
                <div className={styles.Posts}>
                    <a href={'/community/board/2'}>
                        <h2 className={styles.postT}>일반 게시글</h2></a>
                    <PostList posts={normalPosts} boardId={2}/>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
