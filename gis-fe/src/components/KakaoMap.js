import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

// 전역 변수로 중복 초기화 방지
let mapInitialized = false;

// Styled Components
const MapContainer = styled.div`
  position: relative;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  display: flex;
  gap: 5px;
  background-color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const MapTypeButton = styled.button`
  padding: 8px 12px;
  background-color: ${props => props.active ? '#007bff' : '#f8f9fa'};
  color: ${props => props.active ? 'white' : 'black'};
  border: 1px solid #dee2e6;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${props => props.active ? '#0056b3' : '#e9ecef'};
  }
`;

const MapDiv = styled.div`
  width: 100%;
  height: 100vh;
`;

const KakaoMap = () => {
  const [mapType, setMapType] = useState('ROADMAP'); // 기본값: 일반지도
  const mapRef = useRef(null);

  // 저장된 지도 상태 불러오기
  const getSavedMapState = () => {
    try {
      const saved = localStorage.getItem('kakaoMapState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.log('저장된 지도 상태를 불러올 수 없습니다:', error);
    }
    return null;
  };

  // 지도 타입 ID를 문자열로 변환
  const getMapTypeString = (mapTypeId) => {
    const mapTypes = {
      [window.kakao.maps.MapTypeId.ROADMAP]: 'ROADMAP',
      [window.kakao.maps.MapTypeId.SKYVIEW]: 'SKYVIEW',
      [window.kakao.maps.MapTypeId.HYBRID]: 'HYBRID'
    };
    return mapTypes[mapTypeId] || 'ROADMAP';
  };

  // 지도 상태 저장하기
  const saveMapState = React.useCallback((center, level, type) => {
    try {
      const mapState = {
        center: {
          lat: center.getLat(),
          lng: center.getLng()
        },
        level: level,
        type: typeof type === 'string' ? type : getMapTypeString(type),
        timestamp: Date.now()
      };
      localStorage.setItem('kakaoMapState', JSON.stringify(mapState));
    } catch (error) {
      console.log('지도 상태를 저장할 수 없습니다:', error);
    }
  }, []);

  useEffect(() => {
    // 이미 초기화되었으면 중단
    if (mapInitialized) {
      return;
    }

    // 카카오 API가 로드될 때까지 대기
    const initMap = () => {
      if (typeof window.kakao !== 'undefined' && window.kakao.maps && !mapInitialized) {
        const mapContainer = document.getElementById('kakao-map'); // 지도를 표시할 div 
        
        // 저장된 지도 상태 불러오기
        const savedState = getSavedMapState();
        let mapOption;
        
        if (savedState) {
          // 저장된 상태가 있으면 복원
          mapOption = { 
            center: new window.kakao.maps.LatLng(savedState.center.lat, savedState.center.lng),
            level: savedState.level
          };
          setMapType(savedState.type);
          console.log('저장된 지도 상태를 복원했습니다:', savedState);
        } else {
          // 기본 설정
          mapOption = { 
            center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
            level: 3 // 지도의 확대 레벨
          };
        }

        // 지도를 표시할 div와 지도 옵션으로 지도를 생성합니다
        mapRef.current = new window.kakao.maps.Map(mapContainer, mapOption);
        
        // 줌 컨트롤 생성 및 추가 (우측 하단으로 이동)
        const zoomControl = new window.kakao.maps.ZoomControl();
        mapRef.current.addControl(zoomControl, window.kakao.maps.ControlPosition.BOTTOMRIGHT);
        
        // 저장된 지도 타입이 있으면 적용
        if (savedState && savedState.type) {
          mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId[savedState.type]);
        }
        
        // 지도 이동/줌 변경 이벤트 리스너 추가
        window.kakao.maps.event.addListener(mapRef.current, 'center_changed', () => {
          const center = mapRef.current.getCenter();
          const level = mapRef.current.getLevel();
          const currentMapType = mapRef.current.getMapTypeId();
          saveMapState(center, level, currentMapType);
        });
        
        window.kakao.maps.event.addListener(mapRef.current, 'zoom_changed', () => {
          const center = mapRef.current.getCenter();
          const level = mapRef.current.getLevel();
          const currentMapType = mapRef.current.getMapTypeId();
          saveMapState(center, level, currentMapType);
        });
        
        mapInitialized = true; // 초기화 완료 표시
        console.log('카카오 지도가 성공적으로 초기화되었습니다.');
      } else if (!mapInitialized) {
        // API가 아직 로드되지 않았으면 잠시 후 다시 시도
        setTimeout(initMap, 100);
      }
    };

    // 페이지 로드 후 지도 초기화 시도
    initMap();
  }, [saveMapState]);

  // 지도 타입 변경 함수
  const changeMapType = (type) => {
    if (mapRef.current) {
      mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId[type]);
      setMapType(type);
      
      // 지도 타입 변경 시에도 상태 저장
      const center = mapRef.current.getCenter();
      const level = mapRef.current.getLevel();
      saveMapState(center, level, type);
    }
  };

  return (
    <MapContainer>
      <ControlPanel>
        <MapTypeButton
          active={mapType === 'ROADMAP'}
          onClick={() => changeMapType('ROADMAP')}
        >
          일반지도
        </MapTypeButton>
        <MapTypeButton
          active={mapType === 'SKYVIEW'}
          onClick={() => changeMapType('SKYVIEW')}
        >
          항공지도
        </MapTypeButton>
        <MapTypeButton
          active={mapType === 'HYBRID'}
          onClick={() => changeMapType('HYBRID')}
        >
          하이브리드
        </MapTypeButton>
      </ControlPanel>
      
      <MapDiv id="kakao-map" />
    </MapContainer>
  );
};

export default KakaoMap;