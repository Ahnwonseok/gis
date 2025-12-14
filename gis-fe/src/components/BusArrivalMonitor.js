import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';

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

const BusArrivalMonitor = ({ bus, station, onClose }) => {
  const [showNotification, setShowNotification] = useState(false);
  const timerRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const hasNotifiedRef = useRef(false);

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
    if (!stationSeq) {
      console.log('stationSeq를 찾을 수 없습니다.');
      return null;
    }

    const stationID = station?.stationID;
    const routeId = bus.busID || bus.routeId;

    if (!stationID || !routeId) {
      console.log('stationID 또는 routeId가 없습니다.');
      return null;
    }

    try {
      // 백엔드 API를 통해 도착 정보 조회
      const response = await api.get('/bus/arrival', {
        params: {
          stationId: stationID,
          routeId: routeId,
          staOrder: stationSeq,
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
        return data.result;
      }
      return null;
    } catch (error) {
      console.error('버스 도착 정보 조회 오류:', error);
      return null;
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

    // 5초 후 알림 자동 닫기
    setTimeout(() => {
      setShowNotification(false);
      if (onClose) {
        onClose();
      }
    }, 5000);
  };

  useEffect(() => {
    const initialPredictTime = bus.predictTimeSec1;
    
    if (!initialPredictTime || initialPredictTime <= 0) {
      console.log('도착 시간 정보가 없어 알림을 설정할 수 없습니다.');
      return;
    }

    // 30초 전에 API 호출할 시간 계산 (밀리초)
    // 예: predictTimeSec1이 120초(2분)이면, 90초 후에 API 호출
    const checkTime = (initialPredictTime - 30) * 1000;
    
    console.log(`버스 도착 알림 설정: 초기 예상 시간 ${initialPredictTime}초, ${checkTime/1000}초 후 API 호출 예약`);
    
    if (checkTime <= 0) {
      // 이미 30초 이내라면 바로 확인
      console.log('이미 30초 이내이므로 즉시 확인');
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

  return (
    <>
      {showNotification && (
        <NotificationContainer>
          🚌 {bus.busNo}번 버스가 곧 도착합니다!
        </NotificationContainer>
      )}
    </>
  );
};

export default BusArrivalMonitor;

