import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import KakaoMap from './components/KakaoMap';
import StationList from './components/StationList';
import StationSelect from './components/StationSelect';
import BusSelect from './components/BusSelect';
import DestinationSearch from './components/DestinationSearch';

// 모듈 레벨 캐시: stationID -> 상세 정보 (StationSelect의 캐시와 동일하게 유지)
// StationSelect.js에서 export하거나, 여기서도 같은 캐시를 참조할 수 있도록
// 일단 App.js에서도 별도로 관리하되, StationSelect에서 캐시를 사용하도록 함

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'stations', 'stationSelect', 'busSelect', 'destinationSearch', 'map'
  const [selectedStation, setSelectedStation] = useState(null);

  const handleMenuSelect = (menu) => {
    switch(menu) {
      case '정류장 확인':
        setCurrentView('stations');
        break;
      case '위치공유':
        // 추후 구현
        console.log('위치공유 메뉴 - 추후 구현');
        break;
      case '마이페이지':
        // 추후 구현
        console.log('마이페이지 메뉴 - 추후 구현');
        break;
      default:
        break;
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedStation(null);
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
    // 버스 선택 시 처리 (추후 구현)
    console.log('Selected bus:', bus, 'for station:', station);
    // 예: 도착 알림 설정 화면으로 이동
  };

  return (
    <div>
      {currentView === 'main' && (
        <MainMenu onMenuSelect={handleMenuSelect} />
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
        />
      )}
      {currentView === 'destinationSearch' && selectedStation && (
        <DestinationSearch
          station={selectedStation}
          onBack={handleBackToStationSelect}
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
    </div>
  );
}

export default App;
