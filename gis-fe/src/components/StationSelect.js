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

const StationSelect = ({ station, cachedDetail, onBack, onSelect, onDetailLoaded }) => {
  const [stationDetail, setStationDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 정류장 상세 정보 조회 (캐시 또는 기존 상세 정보가 있으면 API 호출하지 않음)
  useEffect(() => {
    // 1. 캐시에서 상세 정보 확인
    if (cachedDetail) {
      setStationDetail(cachedDetail);
      setLoading(false);
      return;
    }

    // 2. station prop에 이미 상세 정보가 있는지 확인
    if (station?.busList && Array.isArray(station.busList) && station.busList.length > 0) {
      const hasDetailInfo = station.busList.some(bus => bus.laneDetail || bus.nextStationName);
      if (hasDetailInfo) {
        setStationDetail(station);
        setLoading(false);
        // 캐시에 저장
        if (station.stationID && onDetailLoaded) {
          onDetailLoaded(station.stationID, station);
        }
        return;
      }
    }

    // 상세 정보가 없으면 API 호출
    const fetchStationDetail = async () => {
      if (!station?.stationID) {
        setError('정류장 정보가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/station/detail', {
          params: {
            stationID: station.stationID,
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
          setError('응답 데이터를 파싱할 수 없습니다.');
          setLoading(false);
          return;
        }

        if (data && data.result) {
          setStationDetail(data.result);
          // 캐시에 저장
          if (station.stationID && onDetailLoaded) {
            onDetailLoaded(station.stationID, data.result);
          }
        } else {
          setError('정류장 상세 정보를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('정류장 상세 정보 조회 오류:', err);
        if (err.response) {
          setError(`서버 오류가 발생했습니다. (${err.response.status})`);
        } else if (err.request) {
          setError('서버에 연결할 수 없습니다.');
        } else {
          setError('정류장 상세 정보를 가져오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStationDetail();
  }, [station?.stationID]);

  const stationName = stationDetail?.stationName || station?.stationName || station?.name || '정류장명 없음';
  const direction = stationDetail?.direction || station?.direction || '';

  const handleSelect = (type) => {
    // 상세 정보가 포함된 station 객체를 전달
    const stationWithDetail = stationDetail || station;
    onSelect(type, stationWithDetail);
  };

  return (
    <Container>
      <Header>
        <Title>정류장 선택</Title>
        <BackButton onClick={onBack}>
          ← 뒤로
        </BackButton>
      </Header>

      {loading && (
        <LoadingMessage>정류장 정보를 불러오는 중...</LoadingMessage>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {!loading && !error && (
        <>
          <StationInfo>
            <StationName>{stationName}</StationName>
            {direction && (
              <StationDirection>→ {direction} 방면</StationDirection>
            )}
          </StationInfo>

          <MenuButtonContainer>
            <MenuButton onClick={() => handleSelect('bus')}>
              1. 버스 선택
            </MenuButton>
            <MenuButton onClick={() => handleSelect('destination')}>
              2. 도착지 검색
            </MenuButton>
          </MenuButtonContainer>
        </>
      )}
    </Container>
  );
};

export default StationSelect;

