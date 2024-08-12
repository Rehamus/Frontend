import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, Route, Routes, useLocation} from 'react-router-dom';
import axiosInstance from './api/axiosInstance';
import Header from './Header/Header';
import HeaderAuth from './Header/HeaderAuth';
import HeaderOn from './Header/HeaderOn';
import UserHashtag from './tool/UserHashtag/UserHashtag';

import NotFoundPage from "./pages/NotFoundPage/NotFoundPage";
import HomePage from './pages/HomePage/HomePage';

import UserPage from "./pages/UserPage/UserPage";
import MyPage from './pages/MyPage/MyPage';
import BookmarkedWebtoons from "./pages/MyPage/bookmarkedWebtoons/bookmarkedWebtoons";
import BookmarkedWebnovels from "./pages/MyPage/bookmarkedWebnovels/bookmarkedWebnovels";

import LoginPage from './pages/LoginPage/LoginPage';
import LoginFailurePage from './pages/LoginPage/LoginFailurePage'; // 추가
import AuthCallback from './api/AuthCallback';
import SignupPage from './pages/SignupPage/SignupPage';

import ContentDetailPage from './pages/ContentDetailPage/ContentDetailPage';
import WebnovelPage from './pages/WebnovelPage/WebnovelPage';
import WebtoonPage from './pages/WebtoonPage/WebtoonPage';

import CommunityPage from './pages/CommunityPage/CommunityPage';
import PostDetailPage from './pages/PostDetailPage/PostDetailPage';
import NewPostPage from './pages/NewPostPage/NewPostPage';
import NewPostReviewPage from './pages/NewPostPage/NewPostReviewPage';
import BoardPage from "./pages/BordsPage/BoardPage";

import AdminLoginPage from "./AdminPages/AdminLogin/AdminLoginPage";
import AdminMainPage from "./AdminPages/AdminMain/AdminMainPage";
import AdminUserManagementPage from "./AdminPages/AdminUserController/AdminUserManagementPage";

import './App.css';
import AdminPostManagementPage from "./AdminPages/AdminPostController/AdminPostManagementPage";
import AdminHashtagManagementPage from "./AdminPages/AdminHashtag/AdminHashtagManagementPage";
import AdminRoute from "./api/AdminRoute";
import AdminContentManagementPage from "./AdminPages/AdminContentsController/AdminContentManagementPage";

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [profile, setProfile] = useState(null);
    const [showTagsModal, setShowTagsModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('Authorization');
        if (token) {
            setIsLoggedIn(true);
        }

        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            setIsAdminLoggedIn(true);
        }

        const tags = localStorage.getItem('tags');
        if (!tags) {
            fetchTopHashtags().then((topTags) => {
                const formattedTags = topTags.map(tag => `#${tag}`).join('');
                localStorage.setItem('tags', formattedTags);
            });
        }
    }, []);

    const fetchUserHashtags = async () => {
        try {
            const response = await axiosInstance.get('/api/user/hashtags', {
                headers: {Authorization: `${localStorage.getItem('Authorization')}`}
            });
            console.log(response.data)

            if (!response.data || response.data.length === 0) {
                setShowTagsModal(true);
            }

            return response.data;

        } catch (error) {
            console.error("유저 해시태그를 불러오는 중 오류가 발생했습니다!", error);
            return [];
        }
    };

    const fetchTopHashtags = async () => {
        try {
            const response = await axiosInstance.get('/api/hashtag/top10');
            return response.data;
        } catch (error) {
            console.error("상위 10개 해시태그를 불러오는 중 오류가 발생했습니다!", error);
            return [];
        }
    };

    const handleLogin = () => {
        setIsLoggedIn(true);
        fetchUserHashtags();
    };

    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('Authorization');
        localStorage.removeItem('RefreshToken');
        localStorage.removeItem('userRole');
        setProfile(null);
        window.read()
    };

    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
        localStorage.removeItem('userRole');
    };

    const handleTagsSubmit = async (selectedTags) => {
        try {
            await axiosInstance.put('/api/user/hashtags', {tags: selectedTags}, {
                headers: {Authorization: `${localStorage.getItem('Authorization')}`}
            });
            setShowTagsModal(false);
        } catch (error) {
            console.error('선호 장르 저장 실패:', error);
        }
    };

    return (<Router>
        <div>
            <HeaderWrapper
                isLoggedIn={isLoggedIn}
                isAdminLoggedIn={isAdminLoggedIn}
                onLogout={handleLogout}
                onAdminLogout={handleAdminLogout}
            />
            <Routes>
                <Route path="/" element={<HomePage onLogin={handleLogin}/>}/>
                <Route path="/*" element={<NotFoundPage/>}/>
                <Route path="/webtoon" element={<WebtoonPage/>}/>
                <Route path="/webnovel" element={<WebnovelPage/>}/>
                <Route path="/content/:cardId" element={<ContentDetailPage isLoggedIn={isLoggedIn}/>}/>

                <Route path="/signup" element={<SignupPage/>}/>
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/login/failure" element={<LoginFailurePage/>}/> {/* 추가 */}
                <Route path="/auth/callback" element={<AuthCallback onLogin={handleLogin}/>}/>

                <Route path="/user/:userId" element={<UserPage/>}/>
                <Route path="/mypage" element={<MyPage setIsLoggedIn={setIsLoggedIn} onLogout={handleLogout}/>}/>
                <Route path="/bookmarkedWebtoons" element={<BookmarkedWebtoons/>}/>
                <Route path="/bookmarkedWebnovels" element={<BookmarkedWebnovels/>}/>


                <Route path="/community" element={<CommunityPage/>}/>
                <Route path="/community/board/:boardId/"
                       element={<BoardPage isLoggedIn={isLoggedIn}/>}/> {/* isLoggedIn 전달 */}
                <Route path="/community/board/:boardId/post/:postId"
                       element={<PostDetailPage isLoggedIn={isLoggedIn}/>}/>
                <Route path="/review/:contentId/new" element={<NewPostReviewPage/>}/>
                <Route path="/community/board/:boardId/post/new" element={<NewPostPage/>}/>

                {/* 어드민 */}
                <Route path="/admin/login" element={<AdminLoginPage onAdminLogin={handleAdminLogin}/>}/>
                <Route path="/admin/main" element={<AdminRoute><AdminMainPage/></AdminRoute>}/>
                <Route path="/admin/user" element={<AdminRoute><AdminUserManagementPage/></AdminRoute>}/>
                <Route path="/admin/post" element={<AdminRoute><AdminPostManagementPage/></AdminRoute>}/>
                <Route path="/admin/hashtag" element={<AdminRoute><AdminHashtagManagementPage/></AdminRoute>}/>
                <Route path="/admin/content" element={<AdminRoute><AdminContentManagementPage/></AdminRoute>}/>
            </Routes>
            {showTagsModal && <UserHashtag onSubmit={handleTagsSubmit} onClose={() => setShowTagsModal(false)}/>}
        </div>
    </Router>);
};

const HeaderWrapper = ({isLoggedIn, isAdminLoggedIn, onLogout, onAdminLogout}) => {
    const location = useLocation();
    const showSimpleHeader = location.pathname === '/signup' || location.pathname === '/login';

    if (showSimpleHeader) {
        return <HeaderAuth/>;
    } else if (isAdminLoggedIn) {
        return <HeaderOn onLogout={onAdminLogout}/>;
    } else if (isLoggedIn) {
        return <HeaderOn onLogout={onLogout}/>;
    } else {
        return <Header/>;
    }
};

export default App;
