import React from 'react';
import Modal from 'react-modal';
import styles from './MyPage.module.css';

const EditProfileModal = ({
                              isOpen,
                              isEditMode,
                              newUsername,
                              setNewUsername,
                              handleEditProfile,
                              handleDeleteAccount,
                              setIsEditMode,
                              setIsModalOpen
                          }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsModalOpen(false)}
            contentLabel="유저 설정"
            className={styles.modal}
            overlayClassName={styles.overlay}
        >
            <h2>유저 설정</h2>
            {isEditMode ? (
                <div>
                    <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="새 닉네임 입력"
                    />
                    <button className={styles.deleteButton} onClick={handleEditProfile}>프로필 수정</button>
                    <button className={styles.deleteButton} onClick={() => setIsEditMode(false)}>취소</button>
                </div>
            ) : (
                <div>
                    <button className={styles.deleteButton} onClick={() => setIsEditMode(true)}>프로필 수정</button>
                    <button onClick={handleDeleteAccount} className={styles.deleteButton}>회원 탈퇴</button>
                    <button className={styles.deleteButton} onClick={() => setIsModalOpen(false)}>닫기</button>
                </div>
            )}
        </Modal>
    );
};

export default EditProfileModal;
