import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './MyPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import CardGrid from './CardGrid';
import ProfileHeader from './ProfileHeader';
import PostList from '../../tool/PostList/PostList';
import PostCard from "../../tool/PostCard/PostCard";
import EditProfileModal from './EditProfileModal';

Modal.setAppElement('#root');

const MyPage = ({ setIsLoggedIn }) => {
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

    const pageSize = 4;
    const offset = (currentPage - 1) * pageSize;

    const fetchData = async () => {
        try {
            const profileResponse = await axiosInstance.get('/api/user', {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });
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

            const webtoonsData = await fetchWebtoonsData();
            const webnovelsData = await fetchWebnovelsData();
            const recommendedPosts = await fetchRecommendedPosts();


            const postsResponse = await axiosInstance.get(`/api/boards/user/posts`, {
                params: { offset, pageSize },
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });

            setRecentPosts(Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts : []);
            setBookmarkedWebtoons(Array.isArray(webtoonsData) ? webtoonsData : []);
            setBookmarkedWebnovels(Array.isArray(webnovelsData) ? webnovelsData : []);
            setTotalPages(postsResponse.data.totalPages);
            // 추천 게시물 설정
            setRecommendedPosts(Array.isArray(recommendedPosts) ? recommendedPosts : []);
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
            setBookmarkedWebtoons([]);
            setBookmarkedWebnovels([]);
            setRecentPosts([]);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage]);

    const handleEditProfile = async () => {
        if (window.confirm('정말로 수정하시겠습니까?')) {
            try {
                await axiosInstance.put('/user/edit', null, {
                    params: { username: newUsername },
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                // 프로필 수정 후 데이터 다시 가져오기
                await fetchData();
                setIsEditMode(false);
                setNewUsername('');
                setIsModalOpen(false); // 수정 후 모달 닫기
            } catch (error) {
                console.error('프로필 수정 실패:', error);
            }
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('정말로 탈퇴하시겠습니까?')) {
            try {
                await axiosInstance.delete('/user/signout', {
                    headers: { Authorization: `${localStorage.getItem('Authorization')}` }
                });
                // 탈퇴 후 로그아웃 및 리디렉션
                localStorage.removeItem('Authorization');
                localStorage.removeItem('userId');
                setProfile(null);
                setIsLoggedIn(false);
                window.location.href = '/';
            } catch (error) {
                console.error('회원 탈퇴 실패:', error);
            }
        }
    };

    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

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
