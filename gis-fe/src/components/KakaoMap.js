import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';

// 전역 변수로 중복 초기화 방지
let mapInitialized = false;
let placesService = null; // 장소 검색 객체
let markers = []; // 마커 배열
let infowindow = null; // 인포윈도우

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

const ZoomControl = styled.div`
  position: absolute;
  top: 70px;
  right: 10px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ZoomButton = styled.button`
  width: 40px;
  height: 40px;
  background-color: white;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e9ecef;
  }

  &:active {
    background-color: #dee2e6;
  }
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

const SearchButton = styled.button`
  padding: 8px 12px;
  background-color: #28a745;
  color: white;
  border: 1px solid #28a745;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.2s ease;

  &:hover {
    background-color: #218838;
  }

  &:active {
    background-color: #1e7e34;
  }
`;

const MapDiv = styled.div`
  width: 100%;
  height: 100vh;
`;

const KakaoMap = () => {
  // 지도 타입 상태 관리 (일반지도, 항공지도, 하이브리드)
  const [mapType, setMapType] = useState('ROADMAP'); // 기본값: 일반지도
  const mapRef = useRef(null); // 지도 인스턴스 참조

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
        
        // 저장된 지도 타입이 있으면 적용
        if (savedState && savedState.type) {
          mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId[savedState.type]);
        }
        
        // 장소 검색 객체 생성
        placesService = new window.kakao.maps.services.Places(mapRef.current);
        
        // 인포윈도우 생성
        infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });
        
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

  // 지도 타입 변경 함수 (중심좌표 유지, 같은 타입 클릭 방지)
  const changeMapType = (maptype) => {
    if (mapRef.current) {
      // 현재 지도 타입 확인
      const currentMapTypeId = mapRef.current.getMapTypeId();
      const currentMapTypeString = getMapTypeString(currentMapTypeId);
      
      // 요청한 타입과 현재 타입이 같으면 아무것도 하지 않음
      const requestedType = maptype === 'roadmap' ? 'ROADMAP' : 
                           maptype === 'skyview' ? 'SKYVIEW' : 'HYBRID';
      
      if (currentMapTypeString === requestedType) {
        console.log('같은 지도 타입입니다. 변경하지 않습니다.');
        return;
      }
      
      // 현재 중심좌표와 줌 레벨 저장
      const currentCenter = mapRef.current.getCenter();
      const currentLevel = mapRef.current.getLevel();
      
      // 지도 타입 변경
      if (maptype === 'roadmap') {
        mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
        setMapType('ROADMAP');
      } else if (maptype === 'skyview') {
        mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.SKYVIEW);
        setMapType('SKYVIEW');
      } else {
        mapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
        setMapType('HYBRID');
      }
      
      // 중심좌표와 줌 레벨 유지
      mapRef.current.setCenter(currentCenter);
      mapRef.current.setLevel(currentLevel);
      
      // 상태 저장
      const mapTypeString = maptype === 'roadmap' ? 'ROADMAP' : 
                           maptype === 'skyview' ? 'SKYVIEW' : 'HYBRID';
      saveMapState(currentCenter, currentLevel, mapTypeString);
    }
  };

  // 지도 확대 함수 (지도 타입 유지)
  const zoomIn = () => {
    if (mapRef.current) {
      // 현재 지도 타입 저장
      const currentMapTypeId = mapRef.current.getMapTypeId();
      
      // 줌 레벨 변경
      const newLevel = mapRef.current.getLevel() - 1;
      mapRef.current.setLevel(newLevel);
      
      // 즉시 지도 타입 복원
      mapRef.current.setMapTypeId(currentMapTypeId);
    }
  };

  // 지도 축소 함수 (지도 타입 유지)
  const zoomOut = () => {
    if (mapRef.current) {
      // 현재 지도 타입 저장
      const currentMapTypeId = mapRef.current.getMapTypeId();
      
      // 줌 레벨 변경
      const newLevel = mapRef.current.getLevel() + 1;
      mapRef.current.setLevel(newLevel);
      
      // 즉시 지도 타입 복원
      mapRef.current.setMapTypeId(currentMapTypeId);
    }
  };

  // 기존 마커 제거 함수
  const removeMarkers = () => {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
  };

  // 지도에 마커를 표시하는 함수
  const displayMarker = (place) => {
    if (!mapRef.current) return;

    // 마커를 생성하고 지도에 표시합니다
    const marker = new window.kakao.maps.Marker({
      map: mapRef.current,
      position: new window.kakao.maps.LatLng(place.y, place.x)
    });

    // 마커 배열에 추가
    markers.push(marker);

    // 마커에 클릭이벤트를 등록합니다
    window.kakao.maps.event.addListener(marker, 'click', function() {
      // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
      if (infowindow) {
        infowindow.setContent('<div style="padding:5px;font-size:12px;">' + place.place_name + '</div>');
        infowindow.open(mapRef.current, marker);
      }
    });
  };

  // 카테고리 검색 완료 시 호출되는 콜백함수
  const placesSearchCB = (data, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      // 기존 마커 제거
      removeMarkers();
      
      // 검색 결과를 마커로 표시
      for (let i = 0; i < data.length; i++) {
        displayMarker(data[i]);
      }
    } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
      alert('검색 결과가 존재하지 않습니다.');
      removeMarkers();
    } else if (status === window.kakao.maps.services.Status.ERROR) {
      alert('검색 결과 중 오류가 발생했습니다.');
      removeMarkers();
    }
  };

  // 은행 검색 함수
  const searchBanks = () => {
    if (!placesService || !mapRef.current) {
      alert('지도가 아직 로드되지 않았습니다.');
      return;
    }

    // 카테고리로 은행을 검색합니다 (BK9: 은행)
    placesService.categorySearch('BK9', placesSearchCB, {
      useMapBounds: true // 현재 지도 영역 내에서 검색
    });
  };

  return (
    <MapContainer>
      <ControlPanel>
        <SearchButton onClick={searchBanks}>
          은행 검색
        </SearchButton>
        <MapTypeButton
          active={mapType === 'ROADMAP'}
          onClick={() => changeMapType('roadmap')}
        >
          일반지도
        </MapTypeButton>
        <MapTypeButton
          active={mapType === 'HYBRID'}
          onClick={() => changeMapType('hybrid')}
        >
          하이브리드
        </MapTypeButton>
        <MapTypeButton
          active={mapType === 'SKYVIEW'}
          onClick={() => changeMapType('skyview')}
        >
          항공지도
        </MapTypeButton>
      </ControlPanel>
      
      <ZoomControl>
        <ZoomButton onClick={zoomIn}>+</ZoomButton>
        <ZoomButton onClick={zoomOut}>-</ZoomButton>
      </ZoomControl>
      
      <MapDiv id="kakao-map" />
    </MapContainer>
  );
};

export default KakaoMap;
