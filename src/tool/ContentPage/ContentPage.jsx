import React, { useEffect, useState, useCallback, useRef } from 'react';
import Card from "../../tool/Card/Card";
import axiosInstance from "../../api/axiosInstance";
import './ContentPage.css';

const ContentPage = ({ type, title, genres, tabs }) => {
    const [contents, setContents] = useState([]);
    const [offset, setOffset] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [selectedGenre, setSelectedGenre] = useState('전체');
    const [selectedSubGenre, setSelectedSubGenre] = useState('');
    const [selectedTab, setSelectedTab] = useState(tabs[0]);
    const genreRefs = useRef([]);
    const [leftPosition, setLeftPosition] = useState(0);
    const [maxWidth, setMaxWidth] = useState(window.innerWidth - 80);
    const containerRef = useRef(null);
    const subgenreRef = useRef(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        setContents([]);
        setOffset(0);
        setHasMore(true);
        fetchContent(0, pageSize, selectedGenre, selectedSubGenre, selectedTab);
    }, [selectedGenre, selectedSubGenre, selectedTab]);

    useEffect(() => {
        if (offset !== 0) {
            fetchContent(offset, pageSize, selectedGenre, selectedSubGenre, selectedTab);
        }
    }, [offset]);

    const fetchContent = async (offset, pageSize, genre, subGenre, tab) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/contents${type}`, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                params: { offset, pagesize: pageSize, genre: subGenre || '', tab }
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
        const handleResize = () => {
            setMaxWidth(window.innerWidth - 80);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleGenreChange = (genre) => {
        if (selectedGenre === genre) {
            setSelectedGenre('전체');
            setSelectedSubGenre('');
        } else {
            setSelectedGenre(genre);
            setSelectedSubGenre('');
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
        setSelectedTab(tab);
    };

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
        const walk = (x - startX.current) ; // Scroll speed
        subgenreRef.current.scrollLeft = scrollLeft.current - walk;
    };

    return (
        <div ref={containerRef} className="content-container">
            <h1>{title}</h1>
            <div className={`genre-filter ${selectedGenre !== '전체' ? 'active' : ''}`}>
                {genres.map((genre, index) => (
                    <div key={genre.name} className="genre-section">
                        <button ref={el => genreRefs.current[index] = el}
                                className={`genre-button ${selectedGenre === genre.name ? 'active' : ''}`}
                                onClick={() => handleGenreChange(genre.name)}
                        >
                            {genre.name}
                        </button>
                        {selectedGenre === genre.name && genre.subGenres.length > 0 && (
                            <div
                                style={{ transform: `translateX( -${leftPosition - 10}px)`}}
                                className="subgenre-filter"
                                ref={subgenreRef}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                            >
                                {genre.subGenres.map((subGenre) => (
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
