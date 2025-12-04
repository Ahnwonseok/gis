import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import KakaoMap from './components/KakaoMap';
import StationList from './components/StationList';
import StationSelect from './components/StationSelect';
import BusSelect from './components/BusSelect';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'stations', 'stationSelect', 'busSelect', 'map'
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
    setSelectedStation(station);
    setCurrentView('stationSelect');
  };

  const handleBackToStations = () => {
    setCurrentView('stations');
  };

  const handleSearchSelect = (searchType) => {
    // searchType: 'bus' 또는 'destination'
    if (searchType === 'bus') {
      setCurrentView('busSelect');
    } else if (searchType === 'destination') {
      // 추후 구현: 도착지 검색 화면으로 이동
      console.log('도착지 검색 - 추후 구현');
    }
  };

  const handleBackToStationSelect = () => {
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
