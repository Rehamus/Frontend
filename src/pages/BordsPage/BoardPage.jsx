import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import './BoardPage.css';

const BoardPage = ({ isLoggedIn }) => {
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [boardTitle, setBoardTitle] = useState('');
    const [noticePosts, setNoticePosts] = useState([]);

    const { boardId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const page = parseInt(query.get('page') || '1', 10);
    const pagesize = 5;
    const asc = true; // 원하는 정렬 기준에 맞게 설정

    useEffect(() => {
        const fetchPosts = async () => {

            const noticeResponse = await axiosInstance.get(`/api/post/list`, {
                params: {postType: 'NOTICE', page: 0, pagesize: 3, asc: false}
            });
            setNoticePosts(noticeResponse.data.responseDtoList);

            try {
                let postType = boardId === '1' ? 'REVIEW' : 'NORMAL';
                const response = await axiosInstance.get('/api/post/list', {
                    params: { postType, page: page - 1, pagesize, asc }
                });

                const { totalPages, responseDtoList } = response.data;

                setPosts(responseDtoList);
                setTotalPages(totalPages);
            } catch (error) {
                console.error("There was an error fetching the posts!", error);
            }
        };

        fetchPosts();
    }, [boardId, page,asc]);

    useEffect(() => {
        setBoardTitle(boardId === '1' ? '리뷰 게시글' : '일반 게시글');
    }, [boardId]);

    const handlePageClick = (pageNumber) => {
        navigate(`/community/board/${boardId}?page=${pageNumber}`);
    };

    return (
        <div className="container">
            <div className="community-header">
                <a href={`/community`}><h1>{boardTitle}</h1></a>
                {isLoggedIn && boardId !== '1' && (
                    <a href={`/community/board/${boardId}/post/new`} className="button">새 글 작성</a>
                )}
            </div>
            <PostList posts={noticePosts} boardId={0}/>
            <PostList
                posts={posts}
                currentPage={page}
                totalPages={totalPages}
                onPageClick={handlePageClick}
                currentPostId={null}
            />
        </div>
    );
};

export default BoardPage;
