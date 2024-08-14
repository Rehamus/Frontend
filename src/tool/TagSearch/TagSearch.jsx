import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import './TagSearch.css';
import axiosInstance from "../../api/axiosInstance";

const TagSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearch = async () => {
        if (searchTerm) {
            try {
                const [contentsResponse, postsResponse] = await Promise.all([
                    axiosInstance.get('/api/contents/search', {
                        params: { keyword: searchTerm, offset: 0, pagesize: 20 }
                    }),
                    axiosInstance.get('/api/post/keyword', {
                        params: { keyword: searchTerm, offset: 0, pagesize: 20 }
                    })
                ]);

                const combinedResults = [
                    ...contentsResponse.data.responseDtoList,
                    ...postsResponse.data
                ];
                setSearchResults(combinedResults);
            } catch (error) {
                console.error('Error fetching search results:', error);
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleResultClick = (result) => {
        console.log(result)
        if (result.platform) {
            navigate(`/content/${result.id}`);
        } else {
            navigate(`community/board/4/post/${result.id}`);
        }
        setIsModalOpen(false);
    };

    return (
        <>
            <button className="open-modal-button" onClick={() => setIsModalOpen(true)}>
                검색
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
                                placeholder="검색"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyPress}
                            />
                            <button className="search-button" onClick={handleSearch}>
                                검색
                            </button>
                        </div>
                        <div className="search-results">
                            {searchResults.length > 0 ? (
                                searchResults.map((result, index) => (
                                    <div
                                        key={index}
                                        className="result-item"
                                        onClick={() => handleResultClick(result)}
                                    >
                                        <h3>{result.title}</h3>
                                        <p>{result.description}</p>
                                    </div>
                                ))
                            ) : (
                                <p>검색 결과가 없습니다</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TagSearch;
