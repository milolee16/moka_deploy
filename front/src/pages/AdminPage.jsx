import AdminDashboard from '../components/admin/AdminDashboard'

function AdminPage() {
    // 향후 이곳에서 관리자 인증 로직을 추가할 수 있습니다.
    // 예를 들어, 로그인 상태가 아니면 로그인 페이지로 리디렉션합니다.
    return (
        <div>
            <AdminDashboard />
        </div>
    )
}

export default AdminPage