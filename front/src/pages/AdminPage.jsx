import React from "react";
import styled from "styled-components";

const AdminPage = () => {
  return (
    <AdminContainer>
      <h1>관리자 페이지</h1>
      <p>이 페이지는 관리자 권한을 가진 사용자만 접근할 수 있습니다.</p>
    </AdminContainer>
  );
};

export default AdminPage;

const AdminContainer = styled.div`
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
`;