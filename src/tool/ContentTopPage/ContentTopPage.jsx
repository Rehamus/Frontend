import React, { useEffect, useState, useCallback } from 'react';
import Card from "../../tool/Card/Card";
import axiosInstance from "../../api/axiosInstance";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import styles from './ContentTopPage.module.css';
import { Navigation } from 'swiper/modules';

const ContentTopPage = ({ type, title }) => {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchContent = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/contents${type}/top`, {
                headers: { Authorization: `${localStorage.getItem('Authorization')}` },
                params: { pagesize: 10, genre: '', tab: '' }
            });
            const content = response.data.map((content, index) => ({
                ...content,
                displayTitle: `${index + 1}위 ${content.title}`
            }));
            setContents(content);
        } catch (error) {
            console.error("컨텐츠를 불러오는 중 오류가 발생했습니다!", error);
        } finally {
            setLoading(false);
        }
    }, [loading, type]);

    useEffect(() => {
        if (contents.length === 0) { // 필요 없는 상태 업데이트를 방지
            fetchContent();
        }
    }, [fetchContent, contents.length]);

    useEffect(() => {
        const swiperContainer = document.querySelector('.swiper-container');
        if (swiperContainer) {
            const swiperInstance = new Swiper(swiperContainer, {
                modules: [Navigation],
                spaceBetween: 10,
                slidesPerView: 4.2,
                navigation: true,
                loop: true,
                breakpoints: {
                    1024: {
                        slidesPerView: 4.2,
                    },
                    600: {
                        slidesPerView: 2.2,
                    },
                    320: {
                        slidesPerView: 1.2,
                    },
                },
            });

            const totalSlides = swiperInstance.slides.length;
            const slidesPerView = swiperInstance.params.slidesPerView;

            if (totalSlides <= slidesPerView) {
                swiperInstance.params.loop = false;
                swiperInstance.update();
            }
        }
    }, [contents]);

    return (
        <div className={styles.topContentContainer}>
            <h1>{title}</h1>
            <Swiper
                modules={[Navigation]}
                spaceBetween={10}
                slidesPerView={4.2}
                navigation
                loop={true}
                breakpoints={{
                    1024: {
                        slidesPerView: 4.2,
                    },
                    600: {
                        slidesPerView: 2.2,
                    },
                    320: {
                        slidesPerView: 1.2,
                    },
                }}
            >
                {contents.map((content, index) => (
                    <SwiperSlide key={index}>
                        <a href={`/content/${content.id}`}>
                            <div className={styles.cardContainer}>
                                <div className={styles.rank}>{index + 1} 위</div>
                                <Card
                                    img={content.imgUrl}
                                    title={content.displayTitle}
                                    platform={content.platform}
                                    author={content.author}
                                    description={content.description}
                                    genre={content.genre}
                                    rating={content.rating}
                                    className={styles.card}
                                />
                            </div>
                        </a>
                    </SwiperSlide>
                ))}
            </Swiper>
            {loading && <p>더 많은 컨텐츠를 불러오는 중...</p>}
        </div>
    );
};

export default ContentTopPage;
