import React from 'react';
import Card from "../../tool/Card/Card";
import styles from './MyPage.module.css'

const CardGrid = ({ items }) => (
    <div className={styles.grid}>
        {items.map((item, index) => (
            <a href={`/content/${item.id}`} key={index}>
                <Card
                    img={item.imgUrl}
                    title={item.title}
                    platform={item.platform}
                    author={item.author}
                    description={item.description}
                    genre={item.genre}
                    rating={item.rating}
                />
            </a>
        ))}
    </div>
);

export default CardGrid;
