import { useState } from 'react';
import Statistics from '../components/admin/Statistics';
import UserStatistics from '../components/admin/UserStatistics';
import CafeStatistics from '../components/admin/CafeStatistics';
import './AdminPage.css';

const TABS = {
    RESERVATIONS: '예약 통계',
    USERS: '사용자 통계',
    CAFES: '카페 통계',
};

function AdminPage() {
    const [activeTab, setActiveTab] = useState(TABS.RESERVATIONS);

    const renderContent = () => {
        switch (activeTab) {
            case TABS.USERS:
                return <UserStatistics />;
            case TABS.CAFES:
                return <CafeStatistics />;
            case TABS.RESERVATIONS:
            default:
                return <Statistics />;
        }
    };

    return (
        <div className="admin-page">
            <h1>관리자 대시보드</h1>
            <nav className="admin-tabs">
                {Object.values(TABS).map((tab) => (
                    <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                        {tab}
                    </button>
                ))}
            </nav>
            <div className="admin-content">{renderContent()}</div>
        </div>
    );
}

export default AdminPage;