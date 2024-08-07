import React from 'react';
import './GenreFilter.css';

const GenreFilter = ({ selectedGenre, onGenreChange }) => {
    const genres = ['전체', '액션', '로맨스', '판타지', '일상', '개그'];

    return (
        <div className="genre-filter">
            {genres.map((genre) => (
                <button
                    key={genre}
                    className={`genre-button ${selectedGenre === genre ? 'active' : ''}`}
                    onClick={() => onGenreChange(genre)}
                >
                    {genre}
                </button>
            ))}
        </div>
    );
}

export default GenreFilter;
