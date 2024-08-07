import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import styles from './CommunityPage.module.css';

const CommunityPage = () => {
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        axiosInstance.get('/api/boards')
            .then(response => {
                const boardsWithPosts = response.data
                    .filter(board => board.id !== 1)
                    .map(board => {
                        return axiosInstance.get(`/api/boards/${board.id}`, {
                            params: { offset: 0, pagesize: 3 }
                        })
                            .then(postResponse => ({
                                ...board,
                                posts: postResponse.data.posts
                            }))
                            .catch(error => {
                                console.error(`There was an error fetching the posts for board ${board.id}!`, error);
                                return { ...board, posts: [] };
                            });
                    });
                Promise.all(boardsWithPosts).then(setBoards);
            })
            .catch(error => {
                console.error("There was an error fetching the boards!", error);
            });
    }, []);

    return (
        <div className={styles.c_container}>
            <div className={styles.communityHeader}>
                <h1>커뮤니티</h1>
            </div>
            <div className={styles.boardList}>
                {boards.map(board => (
                    <div className={styles.boardItem} key={board.id}>
                        <a href={`/community/board/${board.id}`} className={styles.boardLink}>
                            <h2 className={styles.boardTitle}>{board.title}</h2>
                        </a>
                        <PostList posts={board.posts} boardId={board.id} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommunityPage;
