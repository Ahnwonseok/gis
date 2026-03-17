import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';

// 모듈 레벨 캐시: 정류장 목록 저장
let cachedStations = [];

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
  gap: 12px;

  /* 모바일에서 Title이 버튼을 밀어내지 않도록 */
  min-width: 0;

  @media (max-width: 768px) {
    margin-bottom: 18px;
    align-items: flex-start;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    font-size: 1.6rem;
    line-height: 1.2;
  }
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
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }

  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 1.05rem;
    min-height: 50px;
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
  min-height: 100px;
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
  display: flex;
  flex-direction: column;
  gap: 8px;

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
    min-height: 90px;
    font-size: 1.3rem;
    padding: 15px;
  }
`;

const StationName = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const StationDirection = styled.div`
  font-size: 1.2rem;
  font-weight: normal;
  opacity: 0.9;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const StationDistance = styled.div`
  font-size: 1.1rem;
  font-weight: normal;
  opacity: 0.85;
  line-height: 1.4;
  margin-top: 4px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
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

const StationList = ({ onBack, onStationSelect }) => {
  // 캐시된 정류장 목록이 있으면 초기값으로 사용
  const [stations, setStations] = useState(cachedStations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // 검색 성공 여부 추적
  const [statusMessage, setStatusMessage] = useState(''); // 스크린 리더용 상태 메시지
  
  // 포커스 관리를 위한 ref
  const resultsRef = useRef(null);
  const statusRef = useRef(null);
  // 중복 호출 방지를 위한 ref
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  // 현재 위치 가져오기 (주석 처리됨 - 테스트용 고정 좌표 사용)
  // const getCurrentLocation = () => {
  //   return new Promise((resolve, reject) => {
  //     if (!navigator.geolocation) {
  //       reject(new Error('위치 정보를 지원하지 않는 브라우저입니다.'));
  //       return;
  //     }

  //     // 권한 상태 확인 (일부 브라우저에서 지원)
  //     if (navigator.permissions && navigator.permissions.query) {
  //       navigator.permissions.query({ name: 'geolocation' }).then((result) => {
  //         if (result.state === 'denied') {
  //           reject(new Error('위치 정보 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'));
  //           return;
  //         }
  //         requestLocation();
  //       }).catch(() => {
  //         // 권한 API를 지원하지 않으면 바로 요청
  //         requestLocation();
  //       });
  //     } else {
  //       // 권한 API를 지원하지 않으면 바로 요청
  //       requestLocation();
  //     }

  //     function requestLocation() {
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           resolve({
  //             lat: position.coords.latitude,
  //             lng: position.coords.longitude,
  //           });
  //         },
  //         (err) => {
  //           let errorMessage = '위치 정보를 가져올 수 없습니다.';
  //           switch (err.code) {
  //             case err.PERMISSION_DENIED:
  //               errorMessage = '위치 정보 권한이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽 자물쇠 아이콘 클릭\n2. 위치 권한을 "허용"으로 변경\n3. 페이지를 새로고침한 후 다시 시도';
  //               break;
  //             case err.POSITION_UNAVAILABLE:
  //               errorMessage = '위치 정보를 사용할 수 없습니다. GPS를 켜고 다시 시도해주세요.';
  //               break;
  //             case err.TIMEOUT:
  //               errorMessage = '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
  //               break;
  //             default:
  //               errorMessage = '위치 정보를 가져올 수 없습니다.';
  //               break;
  //           }
  //           reject(new Error(errorMessage));
  //         },
  //         {
  //           enableHighAccuracy: true,
  //           timeout: 15000, // 타임아웃 증가
  //           maximumAge: 0,
  //         }
  //       );
  //     }
  //   });
  // };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('위치 정보를 지원하지 않는 브라우저입니다.'));
        return;
      }

      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions
          .query({ name: 'geolocation' })
          .then((result) => {
            if (result.state === 'denied') {
              reject(
                new Error(
                  '위치 정보 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.',
                ),
              );
              return;
            }
            requestLocation();
          })
          .catch(() => {
            requestLocation();
          });
      } else {
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
                errorMessage =
                  '위치 정보 권한이 거부되었습니다.\n\n해결 방법:\n1. 브라우저 주소창 왼쪽 자물쇠 아이콘 클릭\n2. 위치 권한을 "허용"으로 변경\n3. 페이지를 새로고침한 후 다시 시도';
                break;
              case err.POSITION_UNAVAILABLE:
                errorMessage =
                  '위치 정보를 사용할 수 없습니다. GPS를 켜고 다시 시도해주세요.';
                break;
              case err.TIMEOUT:
                errorMessage =
                  '위치 정보 요청 시간이 초과되었습니다. 다시 시도해주세요.';
                break;
              default:
                errorMessage = '위치 정보를 가져올 수 없습니다.';
                break;
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          },
        );
      }
    });
  };

  // 정류장 조회
  const fetchStations = async (isRetry = false) => {
    // 이미 호출 중이면 중복 호출 방지
    if (isFetchingRef.current) {
      console.log('이미 정류장 조회 중입니다. 중복 호출을 방지합니다.');
      return;
    }

    // 재검색 시에는 캐시 무시하고 항상 새로 검색
    if (!isRetry && cachedStations.length > 0) {
      setStations(cachedStations);
      setHasSearched(true);
      setStatusMessage(`${cachedStations.length}개의 정류장을 찾았습니다.`);
      return;
    }

    // 이전 요청 취소
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 새로운 AbortController 생성
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    isFetchingRef.current = true;

    setLoading(true);
    setError(null);
    setLocationError(null);
    setStations([]);
    setStatusMessage('정류장을 검색하고 있습니다...');

    try {
      const location = await getCurrentLocation();

      const response = await api.get('/station', {
        params: {
          x: location.lng,
          y: location.lat,
        },
        signal: abortController.signal,
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
          // 성공 시 에러 상태 초기화
          setError(null);
          setLocationError(null);
          
          // 캐시에 저장
          cachedStations = data.result.lane;
          setStations(cachedStations);
          setHasSearched(true);
          const stationCount = cachedStations.length;
          setStatusMessage(`${stationCount}개의 정류장을 찾았습니다. 아래 목록에서 선택하세요.`);
          
          // 검색 성공 후 결과 영역으로 포커스 이동 (약간의 지연 후)
          setTimeout(() => {
            if (resultsRef.current) {
              resultsRef.current.focus();
            }
          }, 100);
        } else {
          setError('근처에 정류장 정보를 찾을 수 없습니다.');
          setStatusMessage('근처에 정류장 정보를 찾을 수 없습니다.');
        }
      } else {
        console.error('예상하지 못한 응답 구조:', data);
        setError('정류장 정보를 찾을 수 없습니다.');
        setStatusMessage('정류장 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      // AbortError는 무시 (요청이 취소된 경우)
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED' || (err.message && err.message.includes('canceled'))) {
        console.log('정류장 조회가 취소되었습니다.');
        return;
      }
      
      console.error('전체 에러:', err);
      if (err.message && err.message.includes('위치')) {
        setLocationError(err.message);
        setStatusMessage('위치 정보를 가져올 수 없습니다. 다시 시도해주세요.');
      } else if (err.response) {
        // HTTP 에러 응답
        console.error('HTTP 에러:', err.response.status, err.response.data);
        const errorMsg = `서버 오류가 발생했습니다. (${err.response.status})`;
        setError(errorMsg);
        setStatusMessage(errorMsg);
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못함
        console.error('응답 없음:', err.request);
        const errorMsg = '서버에 연결할 수 없습니다.';
        setError(errorMsg);
        setStatusMessage(errorMsg);
      } else {
        const errorMsg = '정류장 정보를 가져오는 중 오류가 발생했습니다.';
        setError(errorMsg);
        setStatusMessage(errorMsg);
        console.error('Error fetching stations:', err);
      }
    } finally {
      // AbortError가 아닌 경우에만 상태 초기화
      if (!abortControllerRef.current || abortControllerRef.current.signal.aborted === false) {
        isFetchingRef.current = false;
        abortControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  // 거리 포맷팅 함수 (미터를 적절한 형식으로 변환)
  const formatDistance = (distanceInMeters) => {
    if (!distanceInMeters && distanceInMeters !== 0) {
      return '';
    }
    
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)}m`;
    } else {
      const km = (distanceInMeters / 1000).toFixed(1);
      return `${km}km`;
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
    
    // 컴포넌트 언마운트 시 진행 중인 요청 취소
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      isFetchingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 배열로 마운트 시 한 번만 실행

  return (
    <Container>
      <Header>
        <Title>근처 정류장</Title>
        <BackButton onClick={onBack}>
          ← 메인
        </BackButton>
      </Header>

      <FindButton 
        onClick={() => fetchStations(true)} 
        disabled={loading}
        aria-label={loading ? '정류장을 검색하고 있습니다' : hasSearched ? '위치를 업데이트하여 다시 검색' : '근처 정류장 찾기'}
        aria-busy={loading}
      >
        {loading ? '검색 중...' : hasSearched ? '위치 업데이트' : '근처 정류장 찾기'}
      </FindButton>

      {/* 스크린 리더용 상태 메시지 */}
      <ScreenReaderOnly
        ref={statusRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </ScreenReaderOnly>

      {locationError && (
        <div>
          <ErrorMessage role="alert" aria-live="assertive">
            {locationError}
          </ErrorMessage>
          {locationError.includes('권한') && (
            <FindButton 
              onClick={() => fetchStations(true)}
              style={{ marginTop: '20px' }}
              aria-label="위치 권한 문제 해결 후 다시 시도"
            >
              다시 시도
            </FindButton>
          )}
        </div>
      )}

      {error && (
        <ErrorMessage role="alert" aria-live="assertive">
          {error}
        </ErrorMessage>
      )}

      {loading && !error && !locationError && (
        <LoadingMessage>정류장을 검색하고 있습니다...</LoadingMessage>
      )}

      {!loading && stations.length > 0 && (
        <StationListContainer
          ref={resultsRef}
          tabIndex={-1}
          role="region"
          aria-label="근처 정류장 목록"
        >
          {stations.slice(0, 3).map((station, index) => {
            const stationName = station.stationName || station.name || '정류장명 없음';
            const direction = station.direction || '';
            const distance = station.distance;
            const formattedDistance = formatDistance(distance);
            
            return (
              <StationButton
                key={index}
                onClick={() => handleStationClick(station)}
                aria-label={`${stationName}${direction ? `, ${direction} 방면` : ''}${formattedDistance ? `, 거리 ${formattedDistance}` : ''}. 선택하려면 클릭하세요.`}
              >
                <StationName>{stationName}</StationName>
                {direction && (
                  <StationDirection>→ {direction} 방면</StationDirection>
                )}
                {formattedDistance && (
                  <StationDistance>📍 {formattedDistance}</StationDistance>
                )}
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