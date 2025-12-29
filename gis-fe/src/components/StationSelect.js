import React, { useState, useEffect, useRef } from 'react';
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

const StationInfo = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 40px;
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

const MenuButtonContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const MenuButton = styled.button`
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

  @media (max-width: 768px) {
    min-height: 90px;
    font-size: 1.5rem;
    padding: 25px 15px;
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

const StationSelect = ({ station, onBack, onSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stationDetail, setStationDetail] = useState(null);
  
  // 중복 호출 방지를 위한 ref
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const lastStationIDRef = useRef(null);
  const completedStationIDRef = useRef(null); // 완료된 stationID 추적
  
  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';

  // 정류장 상세 정보 조회
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적
    
    const fetchStationDetail = async () => {
      const stationID = station?.stationID;
      if (!stationID) {
        if (isMounted) {
          setError('정류장 ID가 없습니다.');
        }
        return;
      }

      // 이미 완료된 stationID이고 stationDetail이 있으면 재사용
      if (completedStationIDRef.current === stationID && stationDetail) {
        setLoading(false);
        isFetchingRef.current = false; // 조회 완료로 표시
        return;
      }
      
      // 같은 stationID를 이미 조회 중이면 중복 호출 방지
      // 단, 이미 완료된 경우에는 loading 상태를 초기화하고 재사용
      if (isFetchingRef.current && lastStationIDRef.current === stationID) {
        // 이미 완료된 stationID인 경우 loading을 false로 설정하고 재사용
        if (completedStationIDRef.current === stationID && stationDetail) {
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
        console.log('이미 같은 정류장 정보를 조회 중입니다. 중복 호출을 방지합니다.');
        return;
      }

      // 이미 busList가 있고 유효한 경우 API 호출 스킵
      if (station?.busList && Array.isArray(station.busList) && station.busList.length > 0) {
        console.log('이미 조회된 버스 노선 정보를 재사용합니다.');
        // 기존 정보를 그대로 사용
        if (isMounted) {
          setStationDetail(station);
          setLoading(false);
        }
        lastStationIDRef.current = stationID;
        completedStationIDRef.current = stationID; // 완료된 stationID 기록
        isFetchingRef.current = false; // 조회 완료로 표시
        return;
      }

      // 이전 요청 취소 (같은 stationID가 아닌 경우에만)
      if (abortControllerRef.current && lastStationIDRef.current !== stationID) {
        abortControllerRef.current.abort();
      }

      // 새로운 AbortController 생성
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      isFetchingRef.current = true;
      lastStationIDRef.current = stationID;

      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/station/detail', {
          params: {
            stationID: stationID,
          },
          signal: abortController.signal,
        });

        if (!isMounted) return;

        let data;
        try {
          data = typeof response.data === 'string' 
            ? JSON.parse(response.data) 
            : response.data;
        } catch (parseError) {
          console.error('JSON 파싱 오류:', parseError);
          if (isMounted) {
            setError('응답 데이터를 파싱할 수 없습니다.');
            setLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        if (data && data.result) {
          // 기본 정보와 상세 정보를 병합
          const mergedStation = {
            ...station,
            ...data.result,
          };
          setStationDetail(mergedStation);
          completedStationIDRef.current = stationID; // 완료된 stationID 기록
        } else {
          setError('정류장 상세 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        // AbortError는 무시 (요청이 취소된 경우)
        if (err.name === 'AbortError' || err.code === 'ERR_CANCELED' || (err.message && err.message.includes('canceled'))) {
          // 취소된 요청은 로그만 남기고 상태 업데이트 안 함
          return;
        }
        
        if (!isMounted) return;
        
        console.error('정류장 상세 정보 조회 오류:', err);
        if (err.response) {
          setError(`서버 오류가 발생했습니다. (${err.response.status})`);
        } else if (err.request) {
          setError('서버에 연결할 수 없습니다.');
        } else {
          setError('정류장 정보를 가져오는 중 오류가 발생했습니다.');
        }
      } finally {
        if (isMounted) {
          isFetchingRef.current = false;
          // 현재 요청의 abortController인 경우에만 null로 설정
          if (abortControllerRef.current === abortController) {
            abortControllerRef.current = null;
          }
          setLoading(false);
        }
      }
    };

    fetchStationDetail();
    
    // cleanup 함수: 컴포넌트 언마운트 시 isMounted만 false로 설정
    // 실제 요청 취소는 새로운 요청이 시작될 때 처리됨 (182-185줄)
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?.stationID]);

  const handleSelect = (type) => {
    // 상세 정보가 로드된 경우 상세 정보를 전달, 아니면 기본 정보만 전달
    const stationToSend = stationDetail || station;
    onSelect(type, stationToSend);
  };

  return (
    <Container>
      <Header>
        <Title>정류장 선택</Title>
          <BackButton 
            onClick={onBack}
            aria-label="근처 정류장 목록으로 돌아가기"
          >
            뒤로
          </BackButton>
      </Header>

      <StationInfo>
        <StationName>{stationName}</StationName>
        {direction && (
          <StationDirection>→ {direction} 방면</StationDirection>
        )}
      </StationInfo>

      {loading && (
        <LoadingMessage>정류장 정보를 불러오는 중...</LoadingMessage>
      )}

      {error && (
        <ErrorMessage role="alert" aria-live="assertive">
          {error}
        </ErrorMessage>
      )}

      {!loading && !error && (
        <MenuButtonContainer role="menu" aria-label="정류장 메뉴">
          <MenuButton 
            onClick={() => handleSelect('bus')}
            role="menuitem"
            aria-label="버스 선택 메뉴"
            disabled={!stationDetail || !stationDetail.busList || stationDetail.busList.length === 0}
          >
            1. 버스 선택
          </MenuButton>
          <MenuButton 
            onClick={() => handleSelect('destination')}
            role="menuitem"
            aria-label="도착지 검색 메뉴"
            disabled={!stationDetail || !stationDetail.busList || stationDetail.busList.length === 0}
          >
            2. 도착지 검색
          </MenuButton>
        </MenuButtonContainer>
      )}
    </Container>
  );
};

export default StationSelect;

