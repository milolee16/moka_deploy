import styled from "styled-components";
import { HiX } from "react-icons/hi";

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    // 모달 외부(어두운 배경) 클릭 시 닫기
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <Backdrop onClick={handleBackdropClick}>
            <Content>
                <CloseButton onClick={onClose}>
                    <HiX size={24} />
                </CloseButton>
                {children}
            </Content>
        </Backdrop>
    );
};

export default Modal;

const Backdrop = styled.div`
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: grid;
    place-items: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease-in-out;
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;

const Content = styled.div`
    background: #f7f5f3;
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 400px;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const CloseButton = styled.button`
    position: absolute;
    top: 12px; right: 12px;
    background: transparent; border: none; cursor: pointer; color: #868e96;
    padding: 4px; border-radius: 50%; display: grid; place-items: center;
    transition: background-color 0.2s;
    &:hover { background-color: #f1f3f5; }
`;