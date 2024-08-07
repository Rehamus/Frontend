import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import PostList from '../../tool/PostList/PostList';
import './BoardPage.css';

const BoardPage = () => {
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [boardTitle, setBoardTitle] = useState('');
    const { boardId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const query = new URLSearchParams(location.search);
    const page = parseInt(query.get('page') || '1', 10);
    const offset = (page - 1) * 5;
    const pagesize = 5;

    useEffect(() => {
        axiosInstance.get(`/api/boards/${boardId}`, {
            params: { offset, pagesize }
        })
            .then(response => {
                setPosts(response.data.posts);
                setTotalPages(response.data.totalPages);
            })
            .catch(error => {
                console.error("There was an error fetching the posts!", error);
            });

    }, [boardId, page]);

    useEffect(() => {
        axiosInstance.get(`/api/boards/${boardId}/title`)
            .then(response => {
                setBoardTitle(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the board title!", error);
            });
    }, [boardId]);

    const handlePageClick = (pageNumber) => {
        navigate(`/community/board/${boardId}?page=${pageNumber}`);
    };

    return (
        <div className="container">
            <div className="community-header">
                <a href={`/community`}><h1>{boardTitle}</h1></a>
                <a href={`/community/board/${boardId}/post/new`} className="button">새 글 작성</a>
            </div>

            <PostList
                posts={posts}
                boardId={boardId}
                currentPage={page}
                totalPages={totalPages}
                onPageClick={handlePageClick}
            />
        </div>
    );
};

export default BoardPage;
