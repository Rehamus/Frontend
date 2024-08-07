import React, { useState, useEffect } from 'react';
import './TagSearch.css';

const TagSearch = ({ onTagSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [genres, setGenres] = useState([]);
    const [filteredGenres, setFilteredGenres] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchTagsWithDelay = () => {
            setTimeout(() => {
                const storedTags = localStorage.getItem('tags');
                const genresArray = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];

                setGenres(genresArray);
                setFilteredGenres(genresArray);
            }, 400); // 0.4초 딜레이
        };

        fetchTagsWithDelay();
    }, []);

    const handleSearchChange = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (term) {
            setFilteredGenres(genres.filter(tag => tag.toLowerCase().includes(term.toLowerCase())));
        } else {
            setFilteredGenres(genres);
        }
    };

    const handleTagClick = (tag) => {
        onTagSelect(tag);
        setIsModalOpen(false);
    };

    return (
        <>
            <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
                태그 검색
            </button>
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>
                            닫기
                        </button>
                        <div className="search-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="태그 검색"
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            <div className="search-results">
                                {filteredGenres.length > 0 ? (
                                    filteredGenres.map(tag => (
                                        <button key={tag} className="tag-button" onClick={() => handleTagClick(tag)}>
                                            {tag}
                                        </button>
                                    ))
                                ) : (
                                    <p>검색 결과가 없습니다</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TagSearch;
