import React from 'react';
import './Card.css';

const platformColors = {
    '리디': '#03beea',
    '문피아': '#034889',
    '카카오페이지': '#FFCD00',
    '네이버': '#00C73C'
};

const Card = ({ img, title, platform, author, description, genre, rating }) => {
    const platformColor = platformColors[platform] || '#ccc';

    return (
        <div className="card">
            <div className="card-img" style={{ backgroundImage: `url(${img})` }}></div>
            <h2 className="card-platform" style={{ backgroundColor: platformColor }}>{platform}</h2>
            <h2 className="card-title">{title}</h2>
            <h6 className="card-author">{author}</h6>
            <p className="card-description">{description}</p>
            <p className="card-genre">장르: {genre}</p>
            <p className="card-rating">평점: {rating}</p>
        </div>
    );
}

export default Card;
