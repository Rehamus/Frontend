import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Plot from 'react-plotly.js';
import styles from './MyPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import CardGrid from './CardGrid';
import ProfileHeader from './ProfileHeader';
import PostList from '../../tool/PostList/PostList';
import PostCard from "../../tool/PostCard/PostCard";
import EditProfileModal from './EditProfileModal';

Modal.setAppElement('#root');

const MyPage = ({ setIsLoggedIn , onLogout }) => {
    const [profile, setProfile] = useState(null);
    const [bookmarkedWebtoons, setBookmarkedWebtoons] = useState([]);
    const [bookmarkedWebnovels, setBookmarkedWebnovels] = useState([]);
    const [recommendedPosts, setRecommendedPosts] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [hashtags, setHashtags] = useState([]);  // 해시태그 상태 추가

    const pageSize = 4;
    const offset = (currentPage - 1) * pageSize;

    const fetchData = async () => {
        try {
            const profileResponse = await axiosInstance.get('/api/user', {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
            console.log(profileResponse.data)
            setProfile(profileResponse.data);

            const fetchWebtoonsData = async () => {
                try {
                    const response = await axiosInstance.get(`/api/contents/webtoon/bookmark`, {
                        headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                        params: { offset, pageSize }
                    });
                    return response.data;
                } catch (error) {
                    console.error("웹툰 데이터를 불러오는 중 오류가 발생했습니다!", error);
                    return [];
                }
            };

            const fetchWebnovelsData = async () => {
                try {
                    const response = await axiosInstance.get(`/api/contents/webnovel/bookmark`, {
                        headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                        params: { offset, pageSize }
                    });
                    return response.data;
                } catch (error) {
                    console.error("웹소설 데이터를 불러오는 중 오류가 발생했습니다!", error);
                    return [];
                }
            };

            const fetchRecommendedPosts = async () => {
                try {
                    const response = await axiosInstance.get('/api/hashtag/recommend', {
                        headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                        params: { offset: 8 }
                    });
                    return response.data;
                } catch (error) {
                    console.error("추천 리스트를 불러오는 중 오류가 발생했습니다!", error);
                    return [];
                }
            };

            const fetchUserHashtags = async () => {
                try {
                    const response = await axiosInstance.get('/api/user/hashtags', {
                        headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                        params: { limit: 10 }
                    });
                    return response.data;
                } catch (error) {
                    console.error("해시태그 데이터를 불러오는 중 오류가 발생했습니다!", error);
                    return [];
                }
            };

            const webtoonsData = await fetchWebtoonsData();
            const webnovelsData = await fetchWebnovelsData();
            const recommendedPosts = await fetchRecommendedPosts();
            const hashtagsData = await fetchUserHashtags();  // 해시태그 데이터 가져오기

            const postsResponse = await axiosInstance.get(`/api/boards/user/posts`, {
                params: { offset, pageSize },
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });

            setRecentPosts(Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts : []);
            setBookmarkedWebtoons(Array.isArray(webtoonsData) ? webtoonsData : []);
            setBookmarkedWebnovels(Array.isArray(webnovelsData) ? webnovelsData : []);
            setTotalPages(postsResponse.data.totalPages);
            setRecommendedPosts(Array.isArray(recommendedPosts) ? recommendedPosts : []);
            setHashtags(hashtagsData);  // 해시태그 상태 설정
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
            setBookmarkedWebtoons([]);
            setBookmarkedWebnovels([]);
            setRecentPosts([]);
            setHashtags([]);  // 오류 발생 시 해시태그 상태 초기화
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const handleEditProfile = async () => {
        if (window.confirm('정말로 수정하시겠습니까?')) {
            try {
                await axiosInstance.put('/api/user/edit', null, {
                    params: { username: newUsername },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                await fetchData();
                setIsEditMode(false);
                setNewUsername('');
                setIsModalOpen(false);
            } catch (error) {
                console.error('프로필 수정 실패:', error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('정말로 탈퇴하시겠습니까?')) {
            try {
                await axiosInstance.delete('/api/auth/signout', {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });

                setProfile(null);
                setIsLoggedIn(false);
                onLogout();
                window.location.href = '/';
            } catch (error) {
                console.error('회원 탈퇴 실패:', error);
            }
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const create3DMapData = (hashtags) => {
        const tiers = [];
        const tags = [];
        const counts = [];

        hashtags.forEach(({ tier, tag, count }) => {
            tiers.push(tier);
            tags.push(tag);
            counts.push(count);
        });

        return { tiers, tags, counts };
    };

    const map3DData = create3DMapData(hashtags);

    if (!profile) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={styles.container}>
            <ProfileHeader
                profile={profile}
                setIsModalOpen={setIsModalOpen}
                setIsEditMode={setIsEditMode}
            />

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    북마크한 웹툰 <a href="/bookmarkedWebtoons" className={styles.more_btu}>더보기</a>
                </h2>
                <CardGrid items={bookmarkedWebtoons} />
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    북마크한 웹소설 <a href="/bookmarkedWebnovels" className={styles.more_btu}>더보기</a>
                </h2>
                <CardGrid items={bookmarkedWebnovels} />
            </div>

            <div className={styles.section}>
                <h2>추천 리스트</h2>
                <PostCard
                    posts={recentPosts}
                    currentPage={currentPage}
                />
            </div>

            <div className={styles.section}>
                <h2>최근 작성한 게시글</h2>
                <PostList
                    posts={recentPosts}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageClick={handlePageClick}
                />
            </div>

            {/* 3D Hashtag Map 추가 */}
            <div className={styles.section}>
                <h2>해시태그 3D 맵</h2>
                <Plot
                    data={[
                        {
                            x: map3DData.tiers,
                            y: map3DData.tags,
                            z: map3DData.counts,
                            mode: 'markers',
                            marker: {
                                size: map3DData.counts,
                                color: map3DData.counts,
                                colorscale: 'Viridis',
                                opacity: 0.8,
                            },
                            type: 'scatter3d',
                            hoverinfo: 'none',  // 호버 텍스트 제거
                        },
                    ]}
                    layout={{
                        width: 700,
                        height: 500,
                        margin: {
                            l: 0,
                            r: 0,
                            t: 0,
                            b: 0,
                        },
                        title: '',  // 제목 제거
                    }}
                    config={{ displayModeBar: false, scrollZoom: false }}  // 모드바 숨기기 및 마우스 휠 확대/축소 비활성화
                />
            </div>

            <EditProfileModal
                isOpen={isModalOpen}
                isEditMode={isEditMode}
                newUsername={newUsername}
                setNewUsername={setNewUsername}
                handleEditProfile={handleEditProfile}
                handleDeleteAccount={handleDeleteAccount}
                setIsEditMode={setIsEditMode}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    );
};

export default MyPage;
