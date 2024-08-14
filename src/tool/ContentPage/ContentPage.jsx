import React, { useEffect, useState, useCallback, useRef } from 'react';
import Card from "../../tool/Card/Card";
import axiosInstance from "../../api/axiosInstance";
import './ContentPage.css';

const ContentPage = ({ type, title, genres, tabs }) => {
    const [contents, setContents] = useState([]);
    const [offset, setOffset] = useState(0);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('전체');
    const [selectedSubGenre, setSelectedSubGenre] = useState('');
    const [selectedTab, setSelectedTab] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const genreRefs = useRef([]);
    const [leftPosition, setLeftPosition] = useState(0);
    const containerRef = useRef(null);
    const subgenreRef = useRef(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        if (offset === 0) {
            setContents([]);
            setHasMore(true);
        }

        fetchContent(offset, pageSize, selectedSubGenre, selectedTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [offset, pageSize, selectedSubGenre, selectedTab]);

    const fetchContent = async (offset, pageSize, subGenre, tab) => {
        if (loading) return;
        setLoading(true);
        try {
            // 로컬 스토리지에서 selectedTag 값을 가져옴
            const selectedTag = localStorage.getItem('selectedTag');
            const genre = selectedTag || subGenre; // selectedTag가 있으면 genre로 사용

            const response = await axiosInstance.get(`/api/contents${type}`, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                params: { offset, pagesize: pageSize, genre: genre || '', platform: tab || '' }
            });
            const content = response.data.map(content => ({
                ...content,
            }));
            setContents(prevContents => [...prevContents, ...content]);
            setHasMore(content.length > 0);
        } catch (error) {
            console.error("컨텐츠를 불러오는 중 오류가 발생했습니다!", error);
        } finally {
            setLoading(false);
        }
    };

    const handleScroll = useCallback(() => {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1 && hasMore && !loading) {
            setOffset(prevOffset => prevOffset + pageSize);
        }
    }, [loading, pageSize, hasMore]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.removeItem('selectedTag');
        }, 1000); // 1초 뒤에 selectedTag 값을 삭제

        return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
    }, []);

    const handleGenreChange = (genre) => {
        if (genre === '전체') {
            setSelectedGenre('전체');
            setSelectedSubGenre('');
        } else {
            setSelectedGenre(genre);
        }

        const genreIndex = genres.findIndex(g => g.name === genre);
        if (genreIndex !== -1 && genreRefs.current[genreIndex]) {
            const genreButtonLeft = genreRefs.current[genreIndex].getBoundingClientRect().left;
            const containerLeft = containerRef.current.getBoundingClientRect().left;
            const adjustedLeftPosition = genreButtonLeft - containerLeft;
            setLeftPosition(adjustedLeftPosition);
        }
    };

    const handleSubGenreChange = (subGenre) => {
        setSelectedSubGenre(subGenre);
    };

    const handleTabChange = (tab) => {
        if (selectedTab === tab) {
            setSelectedTab('');  // 이미 선택된 탭을 다시 누르면 해제
        } else {
            setSelectedTab(tab); // 새로 선택된 탭
        }
    };

    const handleSearchChange = (e) => {
        const searchValue = e.target.value.toLowerCase();
        setSearchTerm(searchValue);

        if (searchValue != null) {
            handleGenreChange('설정 및 테그');
        }
    };

    const filteredSubGenres = selectedGenre !== '전체'
        ? genres.find(genre => genre.name === selectedGenre)?.subGenres.filter(subGenre =>
            subGenre.toLowerCase().includes(searchTerm)
        )
        : [];

    const handleMouseDown = (e) => {
        isDown.current = true;
        subgenreRef.current.classList.add('active');
        startX.current = e.pageX - subgenreRef.current.offsetLeft;
        scrollLeft.current = subgenreRef.current.scrollLeft;
    };

    const handleMouseLeave = () => {
        isDown.current = false;
        subgenreRef.current.classList.remove('active');
    };

    const handleMouseUp = () => {
        isDown.current = false;
        subgenreRef.current.classList.remove('active');
    };

    const handleMouseMove = (e) => {
        if (!isDown.current) return;
        e.preventDefault();
        const x = e.pageX - subgenreRef.current.offsetLeft;
        const walk = (x - startX.current); // Scroll speed
        subgenreRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
        <div ref={containerRef} className="content-container">
            <h1>{title}</h1>
            <div className={`genre-filter ${selectedGenre !== '전체' ? 'active' : ''}`}>
                {genres.map((genre, index) => (
                    <div key={genre.name} className="genre-section">
                        <button
                            ref={el => genreRefs.current[index] = el}
                            className={`genre-button ${
                                (selectedGenre === genre.name ||
                                    (searchTerm && genre.name.toLowerCase().includes('설정 및 태그'.toLowerCase())))
                                    ? 'active'
                                    : ''
                            }`}
                            onClick={() => handleGenreChange(genre.name)}
                        >
                            {genre.name}
                        </button>

                        {selectedGenre === genre.name && (filteredSubGenres.length > 0 || searchTerm) && (
                            <div
                                style={{ transform: `translateX(-${leftPosition - 10}px)` }}
                                className="subgenre-filter"
                                ref={subgenreRef}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                            >
                                {filteredSubGenres.map((subGenre) => (
                                    <button
                                        key={subGenre}
                                        className={`subgenre-button ${selectedSubGenre === subGenre ? 'active' : ''}`}
                                        onClick={() => handleSubGenreChange(subGenre)}
                                    >
                                        {subGenre}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <div className="search-section">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="태그 검색"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <div className="ranking-tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`ranking-tab ${selectedTab === tab ? 'active' : ''}`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="content-grid">
                {contents.map((content, index) => (
                    <a href={`/content/${content.id}`} key={index}>
                        <Card
                            img={content.imgUrl}
                            title={content.title}
                            platform={content.platform}
                            author={content.author}
                            description={content.description}
                            genre={content.genre}
                            rating={content.rating}
                        />
                    </a>
                ))}
            </div>
            {loading && <p>더 많은 컨텐츠를 불러오는 중...</p>}
            {!hasMore && <p>더 이상 컨텐츠가 없습니다.</p>}
        </div>
    );
}

export default ContentPage;
