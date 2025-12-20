import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import api from '../api/axiosInstance';

const MenuContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
`;

const MenuTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 60px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 40px;
  }
`;

const MenuButton = styled.button`
  width: 100%;
  max-width: 500px;
  min-height: 100px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  margin: 15px 0;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    background: rgba(255, 255, 255, 0.4);
  }
  
  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }
  
  @media (max-width: 768px) {
    min-height: 90px;
    font-size: 1.5rem;
    padding: 25px 15px;
  }
`;

const MenuButtonContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TestModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 20000;
  padding: 20px;
`;

const TestContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TestTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  text-align: center;
`;

const CameraPreview = styled.video`
  width: 100%;
  max-height: 400px;
  border-radius: 10px;
  background: #000;
`;

const CameraCanvas = styled.canvas`
  display: none;
`;

const TestButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const TestButton = styled.button`
  flex: 1;
  min-height: 60px;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  background: ${props => props.primary ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'};
  border: 3px solid white;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.primary ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TestResult = styled.div`
  padding: 15px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  font-size: 1rem;
  color: #333;
  white-space: pre-wrap;
  max-height: 200px;
  overflow-y: auto;
`;

const MainMenu = ({ onMenuSelect }) => {
  const [showTest, setShowTest] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResult, setTestResult] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // 네이버 클로바 OCR 설정
  const CLOVA_OCR_SECRET = 'eFRUenNlWEhLdmJyQkhuTlBqWUFxZFRYT3NoWU5oSkY=';
  const CLOVA_OCR_URL = 'https://xkrzt7gj72.apigw.ntruss.com/custom/v1/48680/c0040045314eaa9dd8625b3015fe86447f0cdb70ba931d7e1f6939e019330e58/general';

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      alert('카메라 접근 권한이 필요합니다.');
      setShowTest(false);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 사진 촬영 및 OCR 테스트
  const testOCR = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // canvas를 Blob으로 변환
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setTestResult('이미지 변환 실패');
        return;
      }

      setIsProcessing(true);
      setTestResult('OCR 처리 중...');

      try {
        // multipart/form-data 형식으로 요청
        const formData = new FormData();
        
        // message 필드에 JSON 데이터 추가 (파이썬 샘플과 동일)
        const requestJson = {
          version: 'V2',
          requestId: `test-${Date.now()}`,
          timestamp: Math.round(Date.now()), // 밀리초 단위 (파이썬 샘플: int(round(time.time() * 1000)))
          images: [
            {
              format: 'jpg',
              name: 'demo'
            }
          ]
        };
        
        formData.append('message', JSON.stringify(requestJson));
        formData.append('file', blob, 'image.jpg');

        // 백엔드 프록시를 통해 OCR API 호출 (CORS 문제 해결)
        const response = await api.post(
          '/ocr/recognize',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        console.log('OCR 응답:', response.data);
        
        // OCR 결과에서 텍스트 추출
        if (response.data && response.data.images && response.data.images.length > 0) {
          const fields = response.data.images[0].fields || [];
          const texts = fields.map(field => field.inferText).join(' ');
          setTestResult(`인식된 텍스트:\n${texts}\n\n전체 응답:\n${JSON.stringify(response.data, null, 2)}`);
        } else {
          setTestResult(JSON.stringify(response.data, null, 2));
        }
      } catch (error) {
        console.error('OCR 오류:', error);
        setTestResult(`오류 발생:\n${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : error.stack}`);
      } finally {
        setIsProcessing(false);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleMenuClick = (menu) => {
    // 부모 컴포넌트에 메뉴 선택 알림
    // 토크백이 자동으로 읽어주므로 별도 TTS는 불필요
    if (onMenuSelect) {
      onMenuSelect(menu);
    }
  };

  const handleTestOCR = () => {
    setShowTest(true);
    setTestResult('');
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleCloseTest = () => {
    stopCamera();
    setShowTest(false);
    setTestResult('');
  };

  return (
    <>
      <MenuContainer>
        <MenuTitle>버스 알리미</MenuTitle>
        <MenuButtonContainer>
          <MenuButton
            onClick={() => handleMenuClick('정류장 확인')}
            aria-label="근처 정류장 찾기 메뉴"
          >
            근처 정류장 찾기
          </MenuButton>
          <MenuButton
            onClick={() => handleMenuClick('위치공유')}
            aria-label="위치공유 메뉴"
          >
            위치공유
          </MenuButton>
          <MenuButton
            onClick={() => handleMenuClick('마이페이지')}
            aria-label="마이페이지 메뉴"
          >
            마이페이지
          </MenuButton>
          {/* 테스트용 버튼 - 나중에 삭제 */}
          <MenuButton
            onClick={handleTestOCR}
            style={{ background: 'rgba(255, 193, 7, 0.8)' }}
          >
            [테스트] OCR 테스트
          </MenuButton>
        </MenuButtonContainer>
      </MenuContainer>

      {showTest && (
        <TestModal>
          <TestContainer>
            <TestTitle>네이버 OCR 테스트</TestTitle>
            <CameraPreview
              ref={videoRef}
              autoPlay
              playsInline
            />
            <CameraCanvas ref={canvasRef} />
            {testResult && (
              <TestResult>{testResult}</TestResult>
            )}
            <TestButtonContainer>
              <TestButton onClick={handleCloseTest}>
                닫기
              </TestButton>
              <TestButton
                primary
                onClick={testOCR}
                disabled={isProcessing}
              >
                {isProcessing ? '처리 중...' : 'OCR 테스트'}
              </TestButton>
            </TestButtonContainer>
          </TestContainer>
        </TestModal>
      )}
    </>
  );
};

export default MainMenu;

