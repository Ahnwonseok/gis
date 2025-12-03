import React, { useState, useEffect } from 'react';
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

const RadiusContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
`;

const RadiusButton = styled.button`
  flex: 1;
  min-height: 80px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)'};
  border: 3px solid ${props => props.selected ? '#ffd700' : 'white'};
  border-radius: 15px;
  padding: 15px 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

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

  @media (max-width: 768px) {
    min-height: 70px;
    font-size: 1.3rem;
    padding: 12px 8px;
  }
`;

const FindButton = styled.button`
  width: 100%;
  max-width: 500px;
  min-height: 100px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  margin: 0 auto 30px;
  padding: 30px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  display: block;

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

const LoadingMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  padding: 40px;
`;

const ErrorMessage = styled.div`
  text-align: center;
  color: #ff6b6b;
  font-size: 1.5rem;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin: 20px 0;
`;

const StationListContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const StationButton = styled.button`
  width: 100%;
  min-height: 80px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
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

  @media (max-width: 768px) {
    min-height: 70px;
    font-size: 1.3rem;
    padding: 15px;
  }
`;

const StationList = ({ onBack, onStationSelect }) => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [radius, setRadius] = useState(50); // 기본값 50m

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 정보를 지원하지 않는 브라우저입니다.'));
        return;
      }

      // 권한 상태 확인 (일부 브라우저에서 지원)
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'denied') {
            reject(new Error('위치 정보 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'));
            return;
          }
          requestLocation();
        }).catch(() => {
          // 권한 API를 지원하지 않으면 바로 요청
          requestLocation();
        });
      } else {
        // 권한 API를 지원하지 않으면 바로 요청
        requestLocation();
      }

      function requestLocation() {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (err) => {
            let errorMessage = '위치 정보를 가져올 수 없습니다.';
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = '위치 정보 권한이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽 자물쇠 아이콘 클릭\n2. 위치 권한을 "허용"으로 변경\n3. 페이지를 새로고침한 후 다시 시도';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage = '위치 정보를 사용할 수 없습니다. GPS를 켜고 다시 시도해주세요.';
                break;
              case err.TIMEOUT:
                errorMessage = '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // 타임아웃 증가
            maximumAge: 0,
          }
        );
      }
    });
  };

  // 정류장 조회
  const fetchStations = async () => {
    setLoading(true);
    setError(null);
    setLocationError(null);
    setStations([]);

    try {
      // 현재 위치 가져오기
      const location = await getCurrentLocation();
      
      // 백엔드 API 호출
      const response = await api.get('/station', {
        params: {
          x: location.lng, // 경도
          y: location.lat, // 위도
          radius: radius, // 선택된 반경
        },
      });

      // 응답 데이터 파싱
      let data;
      try {
        data = typeof response.data === 'string' 
          ? JSON.parse(response.data) 
          : response.data;
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('응답 데이터:', response.data);
        setError('응답 데이터를 파싱할 수 없습니다.');
        setLoading(false);
        return;
      }

      // 응답 구조 확인
      console.log('API 응답:', data);

      // 정류장 목록 추출 (백엔드에서 이미 가까운 순으로 정렬되어 옴)
      if (data && data.result && data.result.lane && Array.isArray(data.result.lane)) {
        if (data.result.lane.length > 0) {
          setStations(data.result.lane);
        } else {
          setError('정류장 정보를 찾을 수 없습니다.');
        }
      } else {
        console.error('예상하지 못한 응답 구조:', data);
        setError('정류장 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('전체 에러:', err);
      if (err.message && err.message.includes('위치')) {
        setLocationError(err.message);
      } else if (err.response) {
        // HTTP 에러 응답
        console.error('HTTP 에러:', err.response.status, err.response.data);
        setError(`서버 오류가 발생했습니다. (${err.response.status})`);
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못함
        console.error('응답 없음:', err.request);
        setError('서버에 연결할 수 없습니다.');
      } else {
        setError('정류장 정보를 가져오는 중 오류가 발생했습니다.');
        console.error('Error fetching stations:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStationClick = (station) => {
    if (onStationSelect) {
      onStationSelect(station);
    }
  };

  // 컴포넌트 마운트 시 자동으로 검색 실행
  useEffect(() => {
    fetchStations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 마운트 시 한 번만 실행

  // 반경 변경 시 자동 재검색
  useEffect(() => {
    if (stations.length > 0 || error || locationError) {
      // 이미 검색을 한 번 이상 시도한 경우에만 재검색
      fetchStations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  return (
    <Container>
      <Header>
        <Title>근처 정류장</Title>
        <BackButton onClick={onBack}>
          ← 메인
        </BackButton>
      </Header>

      <RadiusContainer>
        <RadiusButton
          selected={radius === 20}
          onClick={() => setRadius(20)}
        >
          20m
        </RadiusButton>
        <RadiusButton
          selected={radius === 50}
          onClick={() => setRadius(50)}
        >
          50m
        </RadiusButton>
        <RadiusButton
          selected={radius === 100}
          onClick={() => setRadius(100)}
        >
          100m
        </RadiusButton>
        <RadiusButton
          selected={radius === 500}
          onClick={() => setRadius(500)}
        >
          500m
        </RadiusButton>
      </RadiusContainer>

      <FindButton 
        onClick={fetchStations} 
        disabled={loading}
      >
        {loading ? '검색 중...' : '근처 정류장 찾기'}
      </FindButton>

      {locationError && (
        <div>
          <ErrorMessage>{locationError}</ErrorMessage>
          {locationError.includes('권한') && (
            <FindButton 
              onClick={fetchStations}
              style={{ marginTop: '20px' }}
            >
              다시 시도
            </FindButton>
          )}
        </div>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {loading && !error && !locationError && (
        <LoadingMessage>정류장을 검색하고 있습니다...</LoadingMessage>
      )}

      {!loading && stations.length > 0 && (
        <StationListContainer>
          {stations.map((station, index) => {
            const stationName = station.stationName || station.name || '정류장명 없음';
            const direction = station.direction || '';
            const displayText = direction 
              ? `${stationName} - ${direction}`
              : stationName;
            
            return (
              <StationButton
                key={index}
                onClick={() => handleStationClick(station)}
              >
                {displayText}
              </StationButton>
            );
          })}
        </StationListContainer>
      )}

      {!loading && stations.length === 0 && !error && !locationError && (
        <LoadingMessage>
          위 버튼을 눌러 근처 정류장을 찾아주세요.
        </LoadingMessage>
      )}
    </Container>
  );
};

export default StationList;


