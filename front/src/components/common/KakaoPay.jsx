import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Modal from '../Modal'; // 경로가 맞는지 확인해주세요.

const KAKAO_PAY_READY_API_URL = 'http://localhost:8080/api/kakaopay/ready';

// 모달의 컨텐츠 영역 스타일을 확장하여 너비를 조절합니다.
const PaymentModalContent = styled.div`
  background: #fff;
  padding: 0; // iframe이 꽉 차게 패딩 제거
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 450px; // 원하는 너비로 설정
  height: 600px; // 원하는 높이로 설정
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden; // 내용이 넘칠 경우 숨김
`;

function KakaoPay() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                partner_order_id: '12345',
                partner_user_id: 'user123',
                item_name: '테스트 상품',
                quantity: 1,
                total_amount: 75000000,
                tax_free_amount: 0,
            };

            const response = await axios.post(KAKAO_PAY_READY_API_URL, payload);
            
            // 모바일 URL을 우선 사용하고, 없으면 PC URL을 사용합니다.
            const url = response.data.next_redirect_mobile_url || response.data.next_redirect_pc_url;

            if (url) {
                setPaymentUrl(url);
                setIsModalOpen(true);
            } else {
                throw new Error('리다이렉트 URL을 받지 못했습니다.');
            }

        } catch (err) {
            console.error('결제 요청 실패:', err);
            setError('결제 준비 중 오류가 발생했습니다. 다시 시도해 주세요.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setPaymentUrl('');
        // TODO: 여기서 결제가 완료되었는지, 취소되었는지 백엔드에 확인하는 로직을 추가할 수 있습니다.
        // 예를 들어, 사용자가 모달을 그냥 닫았을 경우 'cancel' 상태로 처리할 수 있습니다.
    }

    return (
        <>
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>카카오페이 결제하기</h1>
                <p>아래 버튼을 누르면 테스트 결제 페이지로 이동합니다.</p>

                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? '결제 준비 중...' : '결제하기'}
                </button>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <PaymentModalContent>
                    <iframe
                        src={paymentUrl}
                        title="kakaopay"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                        }}
                        allow="encrypted-media"
                    />
                </PaymentModalContent>
            </Modal>
        </>
    );
}

export default KakaoPay;
