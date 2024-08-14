import React, {useEffect, useState} from 'react';
import './RecommendPage.css';
import ContentPage from "../../tool/ContentPage/ContentPage";

const RecommendPage = () => {
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        const storedTags = localStorage.getItem('tags');
        const genresArray = storedTags ? storedTags.split('#').filter(tag => tag !== "") : [];

        const generatedGenres = [
            {name: '전체', subGenres: []},
            {name: '콘텐츠 형식', subGenres: ['웹소설', '연재중', '연재완결']},
            {name: '평점 및 리뷰', subGenres: ['평점4점이상', '리뷰500개이상', '별점500개이상', '리뷰100개이상', '별점100개이상']},
            {name: '설정 및 테그', subGenres: genresArray}
        ];

        setGenres(generatedGenres);
    }, []);

    return (
        <div className="content-page">
            <ContentPage
                type="/recommend"
                title="추천 웹툰 웹소설"
                genres={genres}
                tabs={['리디', '카카오페이지', '문피아']}
            />
        </div>
    );
}

export default RecommendPage;
