import React from 'react';
import styles from './MyPage.module.css'

const ProfileHeader = ({ profile, setIsModalOpen }) => (
    <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
            <h1 className={styles.name}> {profile.nickname}</h1>
            <p>가입일: {profile.createdAt}</p>
            <p>이메일: {profile.email}</p>
            <button onClick={() => setIsModalOpen(true)} className={styles.button}>유저 설정</button>
        </div>
    </div>
);

export default ProfileHeader;
