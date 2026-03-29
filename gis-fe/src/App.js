import React, { useState, useEffect, useCallback } from 'react';
import MainMenu from './components/MainMenu';
import KakaoMap from './components/KakaoMap';
import LocationShareView from './components/LocationShareView';
import StationList from './components/StationList';
import StationSelect from './components/StationSelect';
import BusSelect from './components/BusSelect';
import DestinationSearch from './components/DestinationSearch';
import BusArrivalMonitor from './components/BusArrivalMonitor';

// 모듈 레벨 캐시: stationID -> 상세 정보 (StationSelect의 캐시와 동일하게 유지)
// StationSelect.js에서 export하거나, 여기서도 같은 캐시를 참조할 수 있도록
// 일단 App.js에서도 별도로 관리하되, StationSelect에서 캐시를 사용하도록 함

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'stations', 'stationSelect', 'busSelect', 'destinationSearch', 'map', 'locationShare'
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedBus, setSelectedBus] = useState(null); // 선택된 버스 정보
  const [isMonitoring, setIsMonitoring] = useState(false); // 알림 모니터링 상태
  const [locationShareWatchId, setLocationShareWatchId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get('share');
    if (share) {
      setLocationShareWatchId(share);
      setCurrentView('locationShare');
    }
  }, []);

  const handleMenuSelect = (menu) => {
    switch(menu) {
      case '정류장 확인':
        setCurrentView('stations');
        break;
      case '위치공유':
        setLocationShareWatchId(null);
        setCurrentView('locationShare');
        break;
      case '마이페이지':
        alert('현재 개발 중입니다.');
        break;
      default:
        break;
    }
  };

  const clearShareQuery = useCallback(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('share')) {
      url.searchParams.delete('share');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    setLocationShareWatchId(null);
  }, []);

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedStation(null);
    clearShareQuery();
  };

  const handleBackFromLocationShare = () => {
    setCurrentView('main');
    clearShareQuery();
  };

  const handleStationSelect = (station) => {
    // 같은 stationID이고 이미 상세 정보가 있으면 기존 selectedStation 유지
    // StationSelect 컴포넌트 내부에서 캐시를 확인하므로 여기서는 그대로 전달
    // StationSelect가 캐시를 확인하여 API 호출 여부를 결정함
    setSelectedStation(station);
    setCurrentView('stationSelect');
  };

  const handleBackToStations = () => {
    // 뒤로 갈 때는 selectedStation을 유지하지 않음 (근처 정류장 목록으로 돌아감)
    // 하지만 selectedStation은 유지하여 나중에 다시 선택할 수 있도록 함
    setCurrentView('stations');
  };

  const handleSearchSelect = (searchType, stationWithDetail) => {
    // searchType: 'bus' 또는 'destination'
    // stationWithDetail: 상세 정보가 포함된 station 객체
    if (stationWithDetail) {
      setSelectedStation(stationWithDetail);
    }
    
    if (searchType === 'bus') {
      setCurrentView('busSelect');
    } else if (searchType === 'destination') {
      setCurrentView('destinationSearch');
    }
  };

  const handleBackToStationSelect = () => {
    // 뒤로 갈 때는 selectedStation을 그대로 유지 (API 호출하지 않음)
    setCurrentView('stationSelect');
  };

  const handleBusSelect = (bus, station) => {
    // 버스 선택 시 알림 모니터링 시작
    console.log('Selected bus:', bus, 'for station:', station);
    setSelectedBus(bus);
    setIsMonitoring(true);
    
    // 알림 권한 요청 (최초 1회)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setSelectedBus(null);
  };

  return (
    <div>
      {currentView === 'main' && (
        <MainMenu onMenuSelect={handleMenuSelect} />
      )}
      {currentView === 'locationShare' && (
        <LocationShareView
          onBack={handleBackFromLocationShare}
          watchSessionId={locationShareWatchId}
        />
      )}
      {currentView === 'stations' && (
        <StationList 
          onBack={handleBackToMain}
          onStationSelect={handleStationSelect}
        />
      )}
      {currentView === 'stationSelect' && selectedStation && (
        <StationSelect
          station={selectedStation}
          onBack={handleBackToStations}
          onSelect={handleSearchSelect}
        />
      )}
      {currentView === 'busSelect' && selectedStation && (
        <BusSelect
          station={selectedStation}
          onBack={handleBackToStationSelect}
          onBusSelect={handleBusSelect}
          onStationUpdate={(updatedStation) => {
            setSelectedStation(updatedStation);
          }}
          selectedBusID={selectedBus?.busID}
          onStopMonitoring={handleStopMonitoring}
        />
      )}
      {currentView === 'destinationSearch' && selectedStation && (
        <DestinationSearch
          station={selectedStation}
          onBack={handleBackToStationSelect}
          onBusSelect={handleBusSelect}
          selectedBusID={selectedBus?.busID}
          onStopMonitoring={handleStopMonitoring}
        />
      )}
      {currentView === 'map' && (
        <div>
          <button 
            onClick={handleBackToMain}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 1000,
              padding: '15px 25px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}
            aria-label="메인 메뉴로 돌아가기"
          >
            ← 메인
          </button>
          <KakaoMap />
        </div>
      )}
      
      {/* 버스 도착 알림 모니터링 */}
      {isMonitoring && selectedBus && selectedStation && (
        <BusArrivalMonitor
          bus={selectedBus}
          station={selectedStation}
          onClose={handleStopMonitoring}
        />
      )}
    </div>
  );
}

export default App;
