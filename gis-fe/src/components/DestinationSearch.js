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
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
`;

const StationDirection = styled.div`
  font-size: 1.2rem;
  color: white;
  opacity: 0.9;
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 20px;
  font-size: 1.5rem;
  border: 3px solid white;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-sizing: border-box;

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  min-height: 80px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const ResultCard = styled.div`
  width: 100%;
  padding: 25px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
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
`;

const BusNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
`;

const RouteInfo = styled.div`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 10px;
  line-height: 1.6;
`;

const StationCount = styled.div`
  font-size: 1.1rem;
  color: white;
  opacity: 0.8;
  margin-top: 10px;
`;

const BusArrivalInfo = styled.div`
  font-size: 1.2rem;
  color: white;
  opacity: 0.9;
  margin-top: 8px;
`;

const NoResultMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
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

const DestinationSearch = ({ station, onBack, onBusSelect, selectedBusID, onStopMonitoring }) => {
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [busToConfirm, setBusToConfirm] = useState(null); // 확인 대기 중인 버스
  const [currentBusList, setCurrentBusList] = useState(station?.busList || []);
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';
  const busList = currentBusList;

  // station prop이 변경될 때 currentBusList 업데이트
  useEffect(() => {
    if (station?.busList) {
      setCurrentBusList(station.busList);
    }
  }, [station]);

  // 초를 분으로 변환하는 함수
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return null;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}분`;
  };

  // 도착지 검색 로직
  const handleSearch = () => {
    if (!destination.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    const departureStationID = station?.stationID;
    if (!departureStationID) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const results = [];

    // 각 버스의 노선에서 도착지 검색
    busList.forEach(bus => {
      const laneDetail = bus.laneDetail;
      if (!laneDetail || !laneDetail.station || !Array.isArray(laneDetail.station)) {
        return;
      }

      const stations = laneDetail.station;
      
      // 출발 정류장과 도착 정류장 찾기 (stationSeq 사용)
      let departureSeq = -1;
      let arrivalSeq = -1;
      let departureStation = null;
      let arrivalStation = null;

      // 검색어 정규화 (공백 제거)
      const searchTerm = destination.trim();
      console.log('검색어:', searchTerm, '길이:', searchTerm.length);
      
      // 먼저 출발 정류장 찾기 (stationID로 비교, 백엔드에서 stationId를 stationID로 변환함)
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        const stationId = station.stationID || station.stationId; // stationID 우선, 없으면 stationId
        if (stationId === departureStationID) {
          departureSeq = station.stationSeq || (i + 1);
          departureStation = station;
          console.log(`출발 정류장 찾음: ${station.stationName} (stationSeq: ${departureSeq})`);
          break;
        }
      }
      
      // 출발 정류장을 찾지 못하면 다음 버스로
      if (departureSeq === -1 || !departureStation) {
        console.log(`❌ 버스 ${bus.busNo}: 출발 정류장을 찾을 수 없음`);
        return;
      }
      
      // 회차점 찾기 (먼저 회차점 정보를 구함)
      let turningPointSeq = -1;
      for (const station of stations) {
        if (station.turnYn === "Y" && station.turnSeq) {
          turningPointSeq = station.turnSeq;
          break;
        }
      }
      
      // turnSeq가 없으면 turningPointIdx 사용 (기존 호환성)
      if (turningPointSeq === -1 && laneDetail.turningPointIdx !== undefined) {
        const turningPointStation = stations[laneDetail.turningPointIdx];
        if (turningPointStation && turningPointStation.stationSeq) {
          turningPointSeq = turningPointStation.stationSeq;
        }
      }

      // 도착 정류장 찾기: 모든 매칭되는 정류장 찾기 (회차점 이후 경로 포함)
      const matchingStations = []; // 매칭되는 모든 정류장 정보
      
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        
        if (station.stationName) {
          // 정류장명 정규화 (모든 공백 제거, 앞뒤 공백 제거)
          const stationName = String(station.stationName).trim();
          
          // 검색어와 정류장명을 모두 정규화하여 비교
          const normalizedStationName = stationName.replace(/\s+/g, '');
          const normalizedSearchTerm = searchTerm.replace(/\s+/g, '');
          
          // 정규화된 문자열로 포함 검색
          if (normalizedStationName.includes(normalizedSearchTerm)) {
            const stationSeq = station.stationSeq || (i + 1);
            matchingStations.push({ station, stationSeq, index: i });
            console.log(`✅ 매칭 발견: ${stationName} (stationSeq: ${stationSeq})`);
          }
        }
      }

      // 출발 정류장을 제외한 모든 매칭 정류장에 대해 경로 유효성 검사
      const validRoutes = [];
      
      for (const match of matchingStations) {
        const candidateArrivalSeq = match.stationSeq;
        const candidateArrivalStation = match.station;
        
        // 출발 정류장과 같은 정류장은 제외
        if (candidateArrivalSeq === departureSeq) {
          continue;
        }

        let stationCount = -1;
        let isValidRoute = false;

        // 케이스 1: 출발 정류장이 도착 정류장보다 앞에 있는 경우 (stationSeq 기준)
        if (departureSeq < candidateArrivalSeq) {
          // 출발과 도착이 모두 회차점 이전에 있는 경우
          if (turningPointSeq === -1 || candidateArrivalSeq <= turningPointSeq) {
            stationCount = candidateArrivalSeq - departureSeq;
            isValidRoute = true;
            console.log(`✅ 버스 ${bus.busNo} 케이스1: 정상 경로 (${stationCount}개 정류장)`);
          }
          // 출발과 도착이 모두 회차점 이후에 있는 경우
          else if (departureSeq > turningPointSeq && candidateArrivalSeq > turningPointSeq) {
            stationCount = candidateArrivalSeq - departureSeq;
            isValidRoute = true;
            console.log(`✅ 버스 ${bus.busNo} 케이스2: 회차점 이후 경로 (${stationCount}개 정류장)`);
          }
          // 출발은 회차점 이전, 도착은 회차점 이후 (순환 경로로 가능)
          // 출발(13) → 회차점(21) → 회차 후 → 도착(22~41)
          else if (turningPointSeq !== -1 && departureSeq <= turningPointSeq && candidateArrivalSeq > turningPointSeq) {
            // 출발 정류장 → 회차점까지 + 회차점 이후 → 도착 정류장까지
            const maxSeq = Math.max(...stations.map(s => s.stationSeq || 0));
            // 정방향: 출발(13) → 회차점(21) = 21 - 13 = 8개
            // 역방향: 회차점 이후 시작 → 도착 = (도착 - 회차점) 개
            stationCount = (turningPointSeq - departureSeq) + (candidateArrivalSeq - turningPointSeq);
            isValidRoute = true;
            console.log(`✅ 버스 ${bus.busNo} 케이스1-1: 회차점 통과 경로 (${stationCount}개 정류장)`);
          }
        }
        // 케이스 3: 출발 정류장이 도착 정류장보다 뒤에 있는 경우 (순환 노선 고려)
        else if (departureSeq > candidateArrivalSeq) {
          // 회차점이 있는 경우에만 순환 경로 가능
          if (turningPointSeq !== -1) {
            // 출발이 회차점 이후인 경우 순환 경로 가능
            if (departureSeq > turningPointSeq) {
              // 순환 경로: 출발 정류장 -> 배열 끝 -> 배열 시작 -> 도착 정류장
              const maxSeq = Math.max(...stations.map(s => s.stationSeq || 0));
              stationCount = (maxSeq - departureSeq + 1) + (candidateArrivalSeq - 1);
              isValidRoute = true;
              console.log(`✅ 버스 ${bus.busNo} 케이스3: 순환 경로 (${stationCount}개 정류장)`);
            }
            // 출발이 회차점 이전이고 도착도 회차점 이전인 경우 (불가능)
            else {
              console.log(`❌ 버스 ${bus.busNo}: 출발이 도착보다 뒤에 있지만 모두 회차점 이전 (불가능)`);
            }
          } else {
            // 회차점이 없으면 순환 경로 불가능
            console.log(`❌ 버스 ${bus.busNo}: 회차점이 없어 순환 경로 불가능`);
          }
        }

        if (isValidRoute && stationCount > 0) {
          validRoutes.push({
            bus: bus,
            stationCount: stationCount,
            departureSeq: departureSeq,
            arrivalSeq: candidateArrivalSeq,
            arrivalStationName: candidateArrivalStation.stationName
          });
        }
      }

      // 유효한 경로들을 결과에 추가
      if (validRoutes.length > 0) {
        console.log(`✅ 버스 ${bus.busNo} 결과 추가: ${validRoutes.length}개 경로`);
        results.push(...validRoutes);
      } else {
        console.log(`❌ 버스 ${bus.busNo}: 유효한 경로 없음`);
      }
    });

    // 경유 정류장이 적은 순으로 정렬, 경유 정류장이 같은 경우 도착 시간이 짧은 것으로 먼저 정렬
    // 운행 정보 없음은 맨 아래로
    results.sort((a, b) => {
      // 운행 정보 확인 함수
      const hasArrivalInfo = (result) => {
        const locationNo1 = result.bus.locationNo1;
        const predictTimeSec1 = result.bus.predictTimeSec1;
        return (locationNo1 !== null && locationNo1 !== undefined) || 
               (predictTimeSec1 !== null && predictTimeSec1 !== undefined);
      };
      
      const hasInfoA = hasArrivalInfo(a);
      const hasInfoB = hasArrivalInfo(b);
      
      // 운행 정보가 있는 것들을 먼저 (운행 정보 없음은 맨 아래)
      if (hasInfoA && !hasInfoB) {
        return -1;
      }
      if (!hasInfoA && hasInfoB) {
        return 1;
      }
      
      // 둘 다 운행 정보가 없으면 동일 순위로 유지
      if (!hasInfoA && !hasInfoB) {
        return 0;
      }
      
      // 둘 다 운행 정보가 있는 경우
      // 1순위: 경유 정류장 개수 (적은 순)
      if (a.stationCount !== b.stationCount) {
        return a.stationCount - b.stationCount;
      }
      
      // 2순위: 경유 정류장이 같은 경우 도착 시간 (짧은 순)
      const timeA = a.bus.predictTimeSec1;
      const timeB = b.bus.predictTimeSec1;
      
      // 둘 다 시간 정보가 있는 경우
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
      // 둘 다 시간 정보가 없으면 동일 순위로 유지
      return 0;
    });

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBusClick = (result) => {
    const bus = result.bus;
    // 이미 선택된 버스를 다시 클릭하면 알림 취소
    if (selectedBusID === bus.busID) {
      if (onStopMonitoring) {
        onStopMonitoring();
        setToastMessage(`${bus.busNo || bus.routeName}번 버스 알림이 취소되었습니다`);
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
      return;
    }
    
    // 버스 선택 시 확인 다이얼로그 표시
    setBusToConfirm(result);
  };

  const handleConfirm = () => {
    if (busToConfirm && onBusSelect) {
      onBusSelect(busToConfirm.bus, station);
      
      // 토스트 메시지 표시
      setToastMessage(`${busToConfirm.bus.busNo || busToConfirm.bus.routeName}번 버스 알림이 설정되었습니다`);
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
        setCurrentBusList(data.result.busList);
        
        // 검색 결과가 있으면 업데이트된 버스 정보로 검색 결과 재계산
        if (searchResults && searchResults.length > 0 && destination.trim()) {
          // 업데이트된 busList로 검색 결과 업데이트
          const updatedResults = searchResults.map(result => {
            // 같은 busID를 가진 버스를 찾아서 업데이트
            const updatedBus = data.result.busList.find(bus => bus.busID === result.bus.busID);
            if (updatedBus) {
              return {
                ...result,
                bus: updatedBus
              };
            }
            return result;
          });
          setSearchResults(updatedResults);
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
        <Title>도착지 검색</Title>
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
        <StationName>출발: {stationName}</StationName>
        {direction && (
          <StationDirection>→ {direction} 방면</StationDirection>
        )}
      </StationInfo>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="도착지 정류장명을 입력하세요"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="도착지 정류장명 입력"
          aria-describedby="search-description"
        />
        <div id="search-description" style={{ display: 'none' }}>
          도착지 정류장명을 입력하고 엔터 키를 누르거나 검색 버튼을 클릭하세요
        </div>
        <SearchButton 
          onClick={handleSearch}
          disabled={isSearching || !destination.trim()}
          aria-label={isSearching ? '검색 중' : '도착지 검색'}
          aria-busy={isSearching}
        >
          {isSearching ? '검색 중...' : '검색'}
        </SearchButton>
      </SearchContainer>

      <ResultContainer
        role="region"
        aria-label="검색 결과"
        aria-live="polite"
      >
        {searchResults !== null && (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => {
                const locationNo1 = result.bus.locationNo1;
                const predictTimeSec1 = result.bus.predictTimeSec1;
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
                
                const isSelected = selectedBusID === result.bus.busID;
                
                const resultAriaLabel = `${result.bus.busNo || result.bus.routeName}번 버스, 도착지 ${result.arrivalStationName}, ${result.stationCount}개 정류장 경유${arrivalInfoText ? `, ${arrivalInfoText}` : ''}${isSelected ? ', 알림 설정됨. 알림을 취소하려면 클릭하세요' : '. 알림을 설정하려면 클릭하세요'}`;
                
                return (
                  <ResultCard 
                    key={`${result.bus.busID || result.bus.routeId}-${index}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleBusClick(result)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleBusClick(result);
                      }
                    }}
                    className={isSelected ? 'selected' : ''}
                    aria-label={resultAriaLabel}
                    aria-pressed={isSelected}
                  >
                    {isSelected && (
                      <>
                        <SelectedBadge aria-hidden="true">
                          알림 설정됨
                        </SelectedBadge>
                        <CancelButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBusClick(result);
                          }}
                          aria-label={`${result.bus.busNo || result.bus.routeName}번 버스 알림 취소`}
                        >
                          알림 취소
                        </CancelButton>
                      </>
                    )}
                    <BusNumber>{result.bus.busNo || result.bus.routeName}번 버스</BusNumber>
                    <RouteInfo>
                      도착: {result.arrivalStationName}
                    </RouteInfo>
                    <StationCount>
                      {result.stationCount}개 정류장 경유
                    </StationCount>
                    {arrivalInfoText && (
                      <BusArrivalInfo>{arrivalInfoText}</BusArrivalInfo>
                    )}
                  </ResultCard>
                );
              })
            ) : (
              <NoResultMessage>
                {destination.trim() ? 
                  '도착지로 가는 직행 버스가 없습니다.' : 
                  '도착지를 입력해주세요.'}
              </NoResultMessage>
            )}
          </>
        )}
      </ResultContainer>

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
            <DialogTitle id="dialog-title">
              {busToConfirm.bus.busNo || busToConfirm.bus.routeName}번 버스
            </DialogTitle>
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
                aria-label={`${busToConfirm.bus.busNo || busToConfirm.bus.routeName}번 버스 알림 설정 확인`}
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

export default DestinationSearch;

