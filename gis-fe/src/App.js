import React, { useState } from 'react';
import MainMenu from './components/MainMenu';
import KakaoMap from './components/KakaoMap';
import StationList from './components/StationList';

function App() {
  const [currentView, setCurrentView] = useState('main'); // 'main', 'stations', 'map'

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
  };

  const handleStationSelect = (station) => {
    // 정류장 선택 시 처리 (추후 구현)
    console.log('Selected station:', station);
    // 예: 정류장 상세 화면으로 이동 또는 버스 검색 화면으로 이동
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
