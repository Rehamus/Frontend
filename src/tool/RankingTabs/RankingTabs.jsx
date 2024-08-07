import React from 'react';
import './RankingTabs.css';

const RankingTabs = ({ selectedTab, onTabChange }) => {
    const tabs = ['실시간 랭킹', '월간 랭킹', '누적 랭킹'];

    return (
        <div className="ranking-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    className={`ranking-tab ${selectedTab === tab ? 'active' : ''}`}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}

export default RankingTabs;
