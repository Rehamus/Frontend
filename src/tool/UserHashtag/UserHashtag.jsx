import React, { useState, useEffect } from 'react';
import styles from './UserHashtag.module.css';

const storedTags = localStorage.getItem('tags');
const genres = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];

const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

const UserHashtag = ({ onSubmit, onClose }) => {
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genreColors, setGenreColors] = useState({});
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const fetchTagsWithDelay = () => {
            setTimeout(() => {
                const storedTags = localStorage.getItem('tags');
                const genresArray = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];
                setGenres(genresArray);
            }, 400); // 0.4초 딜레이
        };

        fetchTagsWithDelay();
    }, []);

    const handleGenreClick = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres((prevSelectedGenres) =>
                prevSelectedGenres.filter((g) => g !== genre)
            );
            setGenreColors((prevGenreColors) => {
                const newColors = { ...prevGenreColors };
                delete newColors[genre];
                return newColors;
            });
        } else {
            const randomColor = getRandomColor();
            setSelectedGenres((prevSelectedGenres) => [...prevSelectedGenres, genre]);
            setGenreColors((prevGenreColors) => ({
                ...prevGenreColors,
                [genre]: randomColor,
            }));
        }
    };

    const handleSubmit = () => {
        const selectedGenresString = selectedGenres.join('#');
        onSubmit("#" + selectedGenresString);
        onClose();
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h1 style={{
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                    padding: '10px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    textAlign: 'center'
                }}>선호하는 태그를 선택해 주세요</h1>
                <div className={styles.genreList}>
                    {genres.map((genre) => (
                        <button
                            key={genre}
                            className={`${styles.genreItem} ${selectedGenres.includes(genre) ? styles.selected : ''}`}
                            onClick={() => handleGenreClick(genre)}
                            style={{
                                backgroundColor: selectedGenres.includes(genre)
                                    ? genreColors[genre]
                                    : '#f9f9f9',
                                borderColor: selectedGenres.includes(genre)
                                    ? genreColors[genre]
                                    : '#ccc',
                                color: selectedGenres.includes(genre) ? '#fff' : '#505050',
                            }}
                        >
                            #{genre}
                        </button>
                    ))}
                </div>
                <button className={styles.button} onClick={handleSubmit}>추가</button>
            </div>
        </div>
    );
};

export default UserHashtag;
