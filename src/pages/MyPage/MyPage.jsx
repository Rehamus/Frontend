import React, { useCallback, useEffect, useState } from 'react';
import Modal from 'react-modal';
import styles from './MyPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import ProfileHeader from './ProfileHeader';
import PostList from '../../tool/PostList/PostList';
import EditProfileModal from './EditProfileModal';
import Card from "../../tool/Card/Card";
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const MyPage = ({ setIsLoggedIn, onLogout }) => {
    const [profile, setProfile] = useState(null);
    const [bookmarkedWebtoons, setBookmarkedWebtoons] = useState([]);
    const [bookmarkedWebnovels, setBookmarkedWebnovels] = useState([]);
    const [recentPosts, setRecentPosts] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [hashtags, setHashtags] = useState([]);

    const navigate = useNavigate();

    const pageSize = 4;
    const offset = (currentPage - 1) * pageSize;

    // fetchData를 useCallback으로 감싸서 메모이제이션합니다.
    const fetchData = useCallback(async () => {
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
            const hashtagsData = await fetchUserHashtags();  // 해시태그 데이터 가져오기

            const postsResponse = await axiosInstance.get(`/api/user/posts`, {
                params: { offset, pageSize },
                headers: { Authorization: `${localStorage.getItem('Authorization')}` }
            });

            setRecentPosts(Array.isArray(postsResponse.data.posts) ? postsResponse.data.posts : []);
            setBookmarkedWebtoons(Array.isArray(webtoonsData) ? webtoonsData : []);
            setBookmarkedWebnovels(Array.isArray(webnovelsData) ? webnovelsData : []);
            setTotalPages(postsResponse.data.totalPages);
            setHashtags(hashtagsData);  // 해시태그 상태 설정
        } catch (error) {
            console.error('데이터 불러오기 실패:', error);
            setBookmarkedWebtoons([]);
            setBookmarkedWebnovels([]);
            setRecentPosts([]);
        }
    }, [offset, pageSize]); // useCallback에 필요한 의존성만 추가합니다.

    useEffect(() => {
        fetchData();
    }, [currentPage, fetchData]); // 의존성 배열에서 fetchData를 안전하게 사용

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

    // 카드 클릭 시 해당 카드의 ID를 사용하여 페이지로 이동
    const handleCardClick = (id) => {
        navigate(`/content/${id}`);
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
                <div className={styles.cardGrid}>
                    {bookmarkedWebtoons.map((item) => (
                        <div onClick={() => handleCardClick(item.id)} key={item.id}>
                            <Card
                                img={item.imgUrl}
                                title={item.title}
                                platform={item.platform}
                                author={item.author}
                                description={item.description}
                                genre={item.genre}
                                rating={item.rating}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    북마크한 웹소설 <a href="/bookmarkedWebnovels" className={styles.more_btu}>더보기</a>
                </h2>
                <div className={styles.cardGrid}>
                    {bookmarkedWebnovels.map((item) => (
                        <div onClick={() => handleCardClick(item.id)} key={item.id}>
                            <Card
                                img={item.imgUrl}
                                title={item.title}
                                platform={item.platform}
                                author={item.author}
                                description={item.description}
                                genre={item.genre}
                                rating={item.rating}
                            />
                        </div>
                    ))}
                </div>
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
