import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const BackButton = styled.button`
  padding: 15px 25px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 3px solid white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }
`;

const RefreshButton = styled.button`
  padding: 15px 25px;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 3px solid white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
  margin-left: 10px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
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

const StationInfo = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  backdrop-filter: blur(10px);
`;

const StationName = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
`;

const StationDirection = styled.div`
  font-size: 1.3rem;
  color: white;
  opacity: 0.9;
`;

const BusListContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const BusButton = styled.button`
  width: 100%;
  min-height: 100px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  position: relative;

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

  &.selected {
    background: rgba(76, 175, 80, 0.4);
    border: 3px solid #4caf50;
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
  }

  @media (max-width: 768px) {
    min-height: 90px;
    font-size: 1.5rem;
    padding: 25px 15px;
  }
`;

const SelectedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4caf50;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 5px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const CancelButton = styled.button`
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(244, 67, 54, 0.8);
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  padding: 8px 15px;
  border: 2px solid white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(244, 67, 54, 1);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }
`;

const BusNumber = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BusArrivalInfo = styled.div`
  font-size: 1.2rem;
  font-weight: normal;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
`;

const DialogContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 3px solid white;
`;

const DialogTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  margin: 0 0 20px 0;
  text-align: center;
`;

const DialogMessage = styled.div`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.6;
`;

const DialogBusInfo = styled.div`
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 30px;
  text-align: center;
`;

const DialogBusNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
`;

const DialogBusArrivalInfo = styled.div`
  font-size: 1.2rem;
  color: white;
  opacity: 0.9;
`;

const DialogButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const DialogButton = styled.button`
  flex: 1;
  min-height: 60px;
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }

  &.confirm {
    background: rgba(76, 175, 80, 0.8);
    
    &:hover {
      background: rgba(76, 175, 80, 1);
    }
  }

  &.cancel {
    background: rgba(244, 67, 54, 0.8);
    
    &:hover {
      background: rgba(244, 67, 54, 1);
    }
  }
`;

const ToastMessage = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  padding: 20px 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  font-size: 1.3rem;
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

const ScreenReaderOnly = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const BusSelect = ({ station, onBack, onBusSelect, onStationUpdate, selectedBusID, onStopMonitoring }) => {
  const [busList, setBusList] = useState(station?.busList || []);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [busToConfirm, setBusToConfirm] = useState(null); // 확인 대기 중인 버스
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);
  
  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';

  useEffect(() => {
    if (station?.busList && Array.isArray(station.busList) && station.busList.length > 0) {
      setBusList(station.busList);
    } else {
      setBusList([]);
    }
  }, [station]);

  // 초를 분으로 변환하는 함수
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return null;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  // 중복 제거 후 도착 시간 기준 정렬
  const uniqueBuses = busList
    .filter((bus, index, self) => 
      index === self.findIndex(b => b.busNo === bus.busNo)
    )
    .sort((a, b) => {
      const timeA = a.predictTimeSec1;
      const timeB = b.predictTimeSec1;
      
      // 도착 시간이 있는 것들을 먼저 (시간이 빠른 순)
      if (timeA !== null && timeA !== undefined && timeB !== null && timeB !== undefined) {
        return timeA - timeB;
      }
      // A만 시간 정보가 있으면 A를 앞으로
      if (timeA !== null && timeA !== undefined) {
        return -1;
      }
      // B만 시간 정보가 있으면 B를 앞으로
      if (timeB !== null && timeB !== undefined) {
        return 1;
      }
      // 둘 다 시간 정보가 없으면 버스번호순으로 정렬
      const numA = parseInt(a.busNo) || 9999;
      const numB = parseInt(b.busNo) || 9999;
      if (numA !== numB) return numA - numB;
      return a.busNo.localeCompare(b.busNo);
    });
  console.log('BusSelect - uniqueBuses:', uniqueBuses, 'length:', uniqueBuses.length);

  const handleBusClick = (bus) => {
    // 이미 선택된 버스를 다시 클릭하면 알림 취소
    if (selectedBusID === bus.busID) {
      if (onStopMonitoring) {
        onStopMonitoring();
        setToastMessage(`${bus.busNo}번 버스 알림이 취소되었습니다`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
      return;
    }
    
    // 버스 선택 시 확인 다이얼로그 표시
    setBusToConfirm(bus);
  };

  const handleConfirm = () => {
    if (busToConfirm && onBusSelect) {
      onBusSelect(busToConfirm, station);
      
      // 토스트 메시지 표시
      setToastMessage(`${busToConfirm.busNo}번 버스 알림이 설정되었습니다`);
      setShowToast(true);
      
      // 3초 후 토스트 자동 닫기
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      
      setBusToConfirm(null);
    }
  };

  const handleCancel = () => {
    setBusToConfirm(null);
  };

  // 다이얼로그 포커스 관리 및 ESC 키 지원
  useEffect(() => {
    if (busToConfirm) {
      // 다이얼로그가 열릴 때 취소 버튼에 포커스
      setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        }
      }, 100);

      // ESC 키로 닫기
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          handleCancel();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [busToConfirm]);

  // 새로고침 함수
  const handleRefresh = async () => {
    const stationID = station?.stationID;
    if (!stationID) {
      console.error('정류장 ID가 없습니다.');
      return;
    }

    setIsRefreshing(true);
    try {
      const response = await api.get('/station/detail', {
        params: {
          stationID: stationID,
        },
      });

      let data;
      try {
        data = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        setIsRefreshing(false);
        return;
      }

      if (data && data.result && data.result.busList) {
        setBusList(data.result.busList);
        
        // 부모 컴포넌트에 업데이트된 정보 전달
        if (onStationUpdate) {
          const updatedStation = {
            ...station,
            ...data.result,
            busList: data.result.busList,
          };
          onStationUpdate(updatedStation);
        }
      }
    } catch (error) {
      console.error('정류장 정보 새로고침 오류:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>버스 선택</Title>
        <div style={{ display: 'flex', gap: '10px' }}>
          <RefreshButton 
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label={isRefreshing ? '새로고침 중' : '버스 정보 새로고침'}
            aria-busy={isRefreshing}
          >
            {isRefreshing ? '새로고침 중...' : '새로고침'}
          </RefreshButton>
          <BackButton 
            onClick={onBack}
            aria-label="정류장 선택 화면으로 돌아가기"
          >
            뒤로
          </BackButton>
        </div>
      </Header>

      <StationInfo>
        <StationName>{stationName}</StationName>
        {direction && (
          <StationDirection>→ {direction} 방면</StationDirection>
        )}
      </StationInfo>

      {uniqueBuses.length > 0 ? (
        <BusListContainer>
          {uniqueBuses.map((bus, index) => {
            const locationNo1 = bus.locationNo1;
            const predictTimeSec1 = bus.predictTimeSec1;
            const arrivalTime = formatTime(predictTimeSec1);
            
            // 도착 정보 표시 로직
            let arrivalInfoText = null;
            if (locationNo1 !== null && locationNo1 !== undefined) {
              if (locationNo1 === 0) {
                // 0개 정류장 전인 경우
                if (arrivalTime) {
                  arrivalInfoText = `곧 도착 (${arrivalTime} 후)`;
                } else {
                  // 0개 정류장 전이고 도착 시간 정보가 없으면 운행 종료 가능성
                  arrivalInfoText = '운행 정보 없음';
                }
              } else {
                // 1개 이상 정류장 전인 경우
                arrivalInfoText = `${locationNo1}개 정류장 전`;
                if (arrivalTime) {
                  arrivalInfoText += ` • 약 ${arrivalTime} 후 도착`;
                }
              }
            } else if (arrivalTime) {
              // locationNo1이 없지만 시간 정보가 있는 경우
              arrivalInfoText = `약 ${arrivalTime} 후 도착`;
            } else {
              // locationNo1도 없고 시간 정보도 없는 경우
              arrivalInfoText = '운행 정보 없음';
            }
            
            const isSelected = selectedBusID === bus.busID;
            
            // 버스 버튼의 aria-label 생성
            let busAriaLabel = `${bus.busNo}번 버스`;
            if (arrivalInfoText) {
              busAriaLabel += `, ${arrivalInfoText}`;
            }
            if (isSelected) {
              busAriaLabel += ', 알림 설정됨. 알림을 취소하려면 클릭하세요';
            } else {
              busAriaLabel += '. 알림을 설정하려면 클릭하세요';
            }
            
            return (
              <BusButton
                key={`${bus.busID}-${index}`}
                onClick={() => handleBusClick(bus)}
                className={isSelected ? 'selected' : ''}
                aria-label={busAriaLabel}
                aria-pressed={isSelected}
                role="button"
              >
                {isSelected && (
                  <>
                    <SelectedBadge aria-hidden="true">
                      알림 설정됨
                    </SelectedBadge>
                    <CancelButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBusClick(bus);
                      }}
                      aria-label={`${bus.busNo}번 버스 알림 취소`}
                    >
                      알림 취소
                    </CancelButton>
                  </>
                )}
                <BusNumber>{bus.busNo}번</BusNumber>
                {arrivalInfoText && (
                  <BusArrivalInfo>{arrivalInfoText}</BusArrivalInfo>
                )}
              </BusButton>
            );
          })}
        </BusListContainer>
      ) : (
        <EmptyMessage>
          이 정류장에 운행하는 버스가 없습니다.
        </EmptyMessage>
      )}

      {/* 확인 다이얼로그 */}
      {busToConfirm && (
        <DialogOverlay 
          onClick={handleCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="dialog-title"
          aria-describedby="dialog-message"
        >
          <DialogContainer 
            ref={dialogRef}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-message"
          >
            <DialogTitle id="dialog-title">{busToConfirm.busNo}번 버스</DialogTitle>
            <DialogMessage id="dialog-message">
              도착 알림을 설정하시겠습니까?
            </DialogMessage>
            <DialogButtonContainer>
              <DialogButton 
                className="cancel" 
                onClick={handleCancel}
                ref={cancelButtonRef}
                aria-label="알림 설정 취소"
              >
                취소
              </DialogButton>
              <DialogButton 
                className="confirm" 
                onClick={handleConfirm}
                ref={confirmButtonRef}
                aria-label={`${busToConfirm.busNo}번 버스 알림 설정 확인`}
              >
                확인
              </DialogButton>
            </DialogButtonContainer>
          </DialogContainer>
        </DialogOverlay>
      )}

      {/* 스크린 리더용 상태 메시지 */}
      <ScreenReaderOnly
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toastMessage}
      </ScreenReaderOnly>

      {/* 토스트 메시지 */}
      {showToast && (
        <ToastMessage
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {toastMessage}
        </ToastMessage>
      )}
    </Container>
  );
};

export default BusSelect;

