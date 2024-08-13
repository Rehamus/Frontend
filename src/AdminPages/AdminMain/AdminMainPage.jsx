import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import Plot from 'react-plotly.js';
import styles from './AdminMainPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import NewNoticePage from "../AdminNewNoticePage/NewNoticePage";
import PostList from "../../tool/PostList/PostList";

const AdminMainPage = () => {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notices, setNotices] = useState([]);
    const [map3D, setMap3D] = useState({});
    const [noticesPage, setNoticesPage] = useState(0);
    const [noticesTotalPages, setNoticesTotalPages] = useState(0);
    const [noticesSize] = useState(4);
    const [hashtagsSize] = useState(100);
    const [loading, setLoading] = useState(true);
    const [sortAscending, setSortAscending] = useState(true);
    const boardId = 0;

    const fetchNotices = useCallback(async () => {
        try {
            const response = await axiosInstance.get(`/api/admin/post/notice/page`, {
                params: {
                    page: noticesPage,
                    size: noticesSize,
                    asc: sortAscending
                },
                headers: {Authorization: localStorage.getItem('Authorization')}
            });

            const {totalPages, responseDtoList} = response.data;
            setNotices(responseDtoList || []);
            setNoticesTotalPages(totalPages);
        } catch (error) {
            console.error('공지사항 조회 중 오류 발생:', error);
            setNotices([]);
        }
    }, [noticesPage, noticesSize, sortAscending]);

    const fetchHashtags = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/api/admin/hashtag/page', {
                params: {page: 0, size: hashtagsSize, sortBy: 'id',asc:false},
                headers: {Authorization: `${localStorage.getItem('Authorization')}`}
            });
            console.log(response.data);


            const data = response.data;
            let hashtagsData = [];

            if (Array.isArray(data)) {
                hashtagsData = data;
            } else if (data && data.content) {
                hashtagsData = data.content;
            } else {
                console.error('Unexpected response format:', data);
            }

            setMap3D(create3DMap(hashtagsData));
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch hashtags:', error);
            setLoading(false);
        }
    }, [hashtagsSize]);

    const create3DMap = (hashtags) => {
        const tiers = [];
        const tags = [];
        const counts = [];

        hashtags.forEach(({tier, tag, count}) => {
            tiers.push(tier);
            tags.push(tag);
            counts.push(count);
        });

        return {tiers, tags, counts};
    };

    const handleCrawlingAction = async (endpoint) => {
        try {
            await axiosInstance.post(`/api/content${endpoint}`,
                {}, {headers: {Authorization: `${localStorage.getItem('Authorization')}`}}
            );
            alert('작업이 성공적으로 완료되었습니다.');
        } catch (error) {
            alert('작업 중 오류가 발생했습니다.');
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        fetchNotices();
    };

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    useEffect(() => {
        fetchHashtags();
    }, [fetchHashtags]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.main}>
                <div className={styles['crawling-form']}>
                    <h2>크롤링 관리</h2>
                    <div className={styles['crawling-btn-container']}>
                        <button onClick={() => handleCrawlingAction('/start/all')}
                                className={styles['crawling-btn']}>전체 크롤링 시작
                        </button>
                        <button onClick={() => handleCrawlingAction('/local')}
                                className={styles['crawling-btn']}>로컬 파일로 저장
                        </button>
                        <button onClick={() => handleCrawlingAction('/local/update')}
                                className={styles['crawling-btn']}>로컬 파일로 DB 업데이트
                        </button>
                    </div>
                    <br/>
                    <h2>관리</h2>
                    <div className={styles['management-btn-container']}>
                        <button onClick={() => navigate('/admin/user')}
                                className={styles['management-btn']}>유저 관리
                        </button>
                        <button onClick={() => navigate('/admin/post')}
                                className={styles['management-btn']}>게시글 관리
                        </button>
                        <button onClick={() => navigate('/admin/content')}
                                className={styles['management-btn']}>컨텐츠 관리
                        </button>
                        <button onClick={() => navigate('/admin/hashtag')}
                                className={styles['management-btn']}>태그 관리
                        </button>
                        <button onClick={() => navigate('/admin/other')}
                                className={styles['management-btn']}>기타 관리
                        </button>
                    </div>
                </div>
                <div className={styles['tags-form']}>
                    <h2>해시태그 순위 탑 100</h2>
                    <Plot
                        data={[
                            {
                                x: map3D.tiers,
                                y: map3D.tags,
                                z: map3D.counts,
                                mode: 'markers',
                                marker: {
                                    size: map3D.counts,
                                    color: map3D.counts,
                                    colorscale: 'Viridis',
                                    opacity: 0.8,
                                },
                                type: 'scatter3d'
                            },
                        ]}
                        layout={{
                            width: 650,
                            height: 500,
                            margin: {
                                l: 0,  // 왼쪽 마진
                                r: 0,  // 오른쪽 마진
                                t: 0,  // 상단 마진
                                b: 0,  // 하단 마진
                            },
                        }}
                    />
                </div>

                <div className={styles['login-form']}>
                    <h2>공지사항 관리</h2>
                    <div className={styles['crawling-btn-container']}>
                        <button onClick={openModal}
                                className={styles['crawling-btn']}>공지 쓰기
                        </button>
                    </div>
                    <div>
                        <h3>
                            <button
                            onClick={() => setSortAscending(prev => !prev)}
                            className={styles.sort_btn}
                        >
                            {sortAscending ? '공지사항 목록 ▲' : '공지사항 목록 ▼'}
                        </button></h3>

                        <PostList
                            posts={notices}
                            boardId={boardId}
                            currentPage={noticesPage}
                            totalPages={noticesTotalPages}
                            onPageClick={(newPage) => setNoticesPage(newPage)}
                        />
                    </div>
                </div>

                {isModalOpen && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <NewNoticePage closeModal={closeModal}/>
                        </div>
                    </div>
                )}
            </div>

            <footer className={styles.footer}>
                <p>&copy; 2023 11조 프로젝트. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AdminMainPage;
