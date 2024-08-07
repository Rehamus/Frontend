import React, {useEffect, useState} from 'react';
import './HomePage.css';
import ContentPage from "../../tool/ContentPage/ContentPage";

const HomePage = ({onLogin}) => {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const storedTags = localStorage.getItem('tags');
        const genresArray = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];

        const generatedGenres = [
            {name: '전체', subGenres: []},
            {name: '플랫폼 관련', subGenres: ['RIDI_ONLY', '리다무']},
            {name: '콘텐츠 형식', subGenres: ['웹소설', '연재중', '연재완결', '19금']},
            {name: '평점 및 리뷰', subGenres: ['평점4점이상', '리뷰500개이상', '별점500개이상', '리뷰100개이상', '별점100개이상']},
            {name: '설정 및 테그', subGenres: genresArray}
        ];

        setGenres(generatedGenres);
    }, []);

    return (
        <div className="content-page">
            <ContentPage
                type=""
                title="웹툰"
                genres={genres}
                tabs={['실시간 랭킹', '월간 랭킹', '누적 랭킹']}
            />
        </div>
    );
}

export default HomePage;
