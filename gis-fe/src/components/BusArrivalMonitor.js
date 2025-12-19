import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';
import axios from 'axios';

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-size: 1.5rem;
  font-weight: bold;
  text-align: center;
  animation: slideDown 0.3s ease-out;
  max-width: 90%;
  
  @keyframes slideDown {
    from {
      transform: translateX(-50%) translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
`;

const CameraModal = styled.div`
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

const CameraContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CameraTitle = styled.h2`
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

const CameraButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const CameraButton = styled.button`
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

const OCRResult = styled.div`
  padding: 15px;
  background: ${props => props.success ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  border-radius: 10px;
  text-align: center;
  font-size: 1.2rem;
  color: ${props => props.success ? '#4caf50' : '#f44336'};
  font-weight: bold;
`;

const BusArrivalMonitor = ({ bus, station, onClose }) => {
  const [showNotification, setShowNotification] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const timerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const hasNotifiedRef = useRef(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // 네이버 클로바 OCR 설정
  const CLOVA_OCR_SECRET = 'eFRUenNlWEhLdmJyQkhuTlBqWUFxZFRYT3NoWU5oSkY=';
  const CLOVA_OCR_URL = 'https://xkrzt7gj72.apigw.ntruss.com/custom/v1/48680/c0040045314eaa9dd8625b3015fe86447f0cdb70ba931d7e1f6939e019330e58/general';

  // 현재 정류장의 stationSeq 찾기
  const findCurrentStationSeq = () => {
    if (!bus.laneDetail || !bus.laneDetail.station || !Array.isArray(bus.laneDetail.station)) {
      return null;
    }

    const stationID = station?.stationID;
    if (!stationID) return null;

    for (const routeStation of bus.laneDetail.station) {
      const routeStationID = routeStation.stationID || routeStation.stationId;
      if (routeStationID === stationID) {
        return routeStation.stationSeq;
      }
    }
    return null;
  };

  // 버스 도착 정보 조회 API 호출
  const checkBusArrival = async () => {
    const stationSeq = findCurrentStationSeq();
    
    const stationID = station?.stationID;
    const routeId = bus.busID || bus.routeId;

    if (!stationID || !routeId) {
      console.log('stationID 또는 routeId가 없습니다.');
      return null;
    }

    if (!stationSeq) {
      console.warn('stationSeq를 찾을 수 없습니다. API 호출을 시도합니다.');
      // stationSeq가 없어도 API 호출 시도 (백엔드에서 처리할 수 있도록)
    }

    try {
      console.log('bus/arrival API 호출:', {
        stationId: stationID,
        routeId: routeId,
        staOrder: stationSeq
      });
      
      // 백엔드 API를 통해 도착 정보 조회
      const response = await api.get('/bus/arrival', {
        params: {
          stationId: stationID,
          routeId: routeId,
          staOrder: stationSeq || 0, // stationSeq가 없으면 0으로 전송
        },
      });

      let data;
      try {
        data = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        return null;
      }

      if (data && data.result) {
        console.log('bus/arrival API 응답:', data.result);
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('버스 도착 정보 조회 오류:', error);
      return null;
    }
  };

  // 카메라 시작
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // 후면 카메라 우선
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('카메라 접근 오류:', error);
      alert('카메라 접근 권한이 필요합니다.');
      setShowCamera(false);
    }
  };

  // 카메라 중지
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // 사진 촬영
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // canvas를 base64로 변환
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = imageData.split(',')[1]; // data:image/jpeg;base64, 제거

    // OCR 호출
    recognizeBusNumber(base64Data);
  };

  // 네이버 클로바 OCR로 버스 번호 인식
  const recognizeBusNumber = async (base64Image) => {
    setIsProcessing(true);
    setOcrResult(null);

    try {
      const response = await axios.post(
        CLOVA_OCR_URL,
        {
          version: 'V2',
          requestId: `bus-${Date.now()}`,
          timestamp: Date.now(),
          images: [
            {
              format: 'jpg',
              name: 'bus-number',
              data: base64Image,
              url: null
            }
          ]
        },
        {
          headers: {
            'X-OCR-SECRET': CLOVA_OCR_SECRET,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OCR 응답:', response.data);

      // OCR 결과에서 텍스트 추출
      if (response.data && response.data.images && response.data.images.length > 0) {
        const imageResult = response.data.images[0];
        if (imageResult.fields) {
          // 모든 필드의 텍스트 추출
          const allText = imageResult.fields
            .map(field => field.inferText)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          console.log('인식된 텍스트:', allText);

          // 버스 번호 추출 (숫자만 추출)
          const busNumberMatch = allText.match(/\d+/);
          if (busNumberMatch) {
            const recognizedBusNo = busNumberMatch[0];
            const selectedBusNo = bus.busNo.replace(/[^0-9]/g, ''); // 선택한 버스 번호에서 숫자만 추출

            console.log('인식된 버스 번호:', recognizedBusNo, '선택한 버스 번호:', selectedBusNo);

            if (recognizedBusNo === selectedBusNo) {
              setOcrResult({ success: true, message: `✅ ${bus.busNo}번 버스 확인!` });
              // 3초 후 카메라 닫기
              setTimeout(() => {
                stopCamera();
                setShowCamera(false);
                setShowNotification(false);
                if (onClose) {
                  onClose();
                }
              }, 3000);
            } else {
              setOcrResult({ success: false, message: `❌ 버스 번호 불일치 (인식: ${recognizedBusNo}번, 선택: ${bus.busNo}번)` });
            }
          } else {
            setOcrResult({ success: false, message: '버스 번호를 인식할 수 없습니다.' });
          }
        } else {
          setOcrResult({ success: false, message: '텍스트를 인식할 수 없습니다.' });
        }
      } else {
        setOcrResult({ success: false, message: 'OCR 결과를 받을 수 없습니다.' });
      }
    } catch (error) {
      console.error('OCR 오류:', error);
      setOcrResult({ success: false, message: 'OCR 처리 중 오류가 발생했습니다.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 알림 표시 및 진동
  const showArrivalNotification = () => {
    if (hasNotifiedRef.current) return;
    
    hasNotifiedRef.current = true;
    setShowNotification(true);

    // 브라우저 알림 요청
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('버스 도착 알림', {
        body: `${bus.busNo}번 버스가 곧 도착합니다!`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('버스 도착 알림', {
            body: `${bus.busNo}번 버스가 곧 도착합니다!`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          });
        }
      });
    }

    // 진동 (모바일)
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // 카메라 모달 열기
    setShowCamera(true);
    startCamera();

    // 알림은 카메라 모달이 닫힐 때까지 유지
  };

  useEffect(() => {
    const initialPredictTime = bus.predictTimeSec1;
    
    console.log('BusArrivalMonitor 시작:', {
      busNo: bus.busNo,
      busID: bus.busID,
      stationID: station?.stationID,
      predictTimeSec1: initialPredictTime,
      hasLaneDetail: !!bus.laneDetail
    });
    
    // predictTimeSec1이 없어도 주기적으로 확인 시작
    if (!initialPredictTime || initialPredictTime <= 0) {
      console.log('도착 시간 정보가 없어 주기적으로 확인합니다.');
      // 즉시 한 번 확인
      checkBusArrival().then(arrivalInfo => {
        if (arrivalInfo && arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 <= 60) {
          showArrivalNotification();
        } else {
          // 주기적 확인 시작
          console.log('주기적 확인 시작 (30초마다)');
          checkIntervalRef.current = setInterval(async () => {
            console.log('주기적 확인 실행 중...');
            const arrivalInfo = await checkBusArrival();
            if (arrivalInfo) {
              console.log('주기적 확인 - predictTimeSec1:', arrivalInfo.predictTimeSec1);
              if (arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 <= 60) {
                showArrivalNotification();
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }
              } else if (!arrivalInfo.predictTimeSec1 || arrivalInfo.predictTimeSec1 <= 0) {
                console.log('운행 종료로 간주, 폴링 중지');
                if (checkIntervalRef.current) {
                  clearInterval(checkIntervalRef.current);
                  checkIntervalRef.current = null;
                }
              }
            }
          }, 30000);
        }
      });
      
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    }

    // 1분(60초) 전에 API 호출할 시간 계산 (밀리초)
    // 예: predictTimeSec1이 120초(2분)이면, 60초 후에 API 호출
    const checkTime = (initialPredictTime - 60) * 1000;
    
    console.log(`버스 도착 알림 설정: 초기 예상 시간 ${initialPredictTime}초, ${checkTime/1000}초 후 API 호출 예약`);
    
    if (checkTime <= 0) {
      // 이미 1분 이내라면 바로 확인
      console.log('이미 1분 이내이므로 즉시 확인');
      checkBusArrival().then(arrivalInfo => {
        if (arrivalInfo && arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 <= 60) {
          showArrivalNotification();
        }
      });
    } else {
      // 30초 전에 API 호출하도록 예약
      console.log(`${checkTime/1000}초 후 API 호출 예약됨`);
      timerRef.current = setTimeout(() => {
        console.log('예약된 시간에 API 호출 시작');
        checkBusArrival().then(arrivalInfo => {
          if (arrivalInfo) {
            console.log('API 응답 - predictTimeSec1:', arrivalInfo.predictTimeSec1);
            if (arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 <= 60) {
              showArrivalNotification();
            } else {
              // 60초 초과면 주기적으로 확인 (30초마다)
              // 단, predictTimeSec1이 0이거나 음수면 운행 종료로 간주하고 폴링 중지
              if (arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 > 0) {
                console.log('60초 초과, 30초마다 주기적 확인 시작');
                checkIntervalRef.current = setInterval(async () => {
                  const arrivalInfo = await checkBusArrival();
                  if (arrivalInfo) {
                    console.log('주기적 확인 - predictTimeSec1:', arrivalInfo.predictTimeSec1);
                    if (arrivalInfo.predictTimeSec1 && arrivalInfo.predictTimeSec1 <= 60) {
                      showArrivalNotification();
                      if (checkIntervalRef.current) {
                        clearInterval(checkIntervalRef.current);
                      }
                    } else if (!arrivalInfo.predictTimeSec1 || arrivalInfo.predictTimeSec1 <= 0) {
                      // 운행 종료로 간주하고 폴링 중지
                      console.log('운행 종료로 간주, 폴링 중지');
                      if (checkIntervalRef.current) {
                        clearInterval(checkIntervalRef.current);
                      }
                    }
                  }
                }, 30000);
              } else {
                console.log('운행 정보 없음, 폴링 중지');
              }
            }
          }
        });
      }, checkTime);
    }

    // 정리 함수
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [bus, station]);

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <>
      {showNotification && !showCamera && (
        <NotificationContainer>
          🚌 {bus.busNo}번 버스가 곧 도착합니다!
        </NotificationContainer>
      )}
      
      {showCamera && (
        <CameraModal>
          <CameraContainer>
            <CameraTitle>버스 번호 인식</CameraTitle>
            <CameraPreview
              ref={videoRef}
              autoPlay
              playsInline
            />
            <CameraCanvas ref={canvasRef} />
            {ocrResult && (
              <OCRResult success={ocrResult.success}>
                {ocrResult.message}
              </OCRResult>
            )}
            <CameraButtonContainer>
              <CameraButton
                onClick={() => {
                  stopCamera();
                  setShowCamera(false);
                  setShowNotification(false);
                  if (onClose) {
                    onClose();
                  }
                }}
              >
                취소
              </CameraButton>
              <CameraButton
                primary
                onClick={capturePhoto}
                disabled={isProcessing}
              >
                {isProcessing ? '인식 중...' : '촬영'}
              </CameraButton>
            </CameraButtonContainer>
          </CameraContainer>
        </CameraModal>
      )}
    </>
  );
};

export default BusArrivalMonitor;

