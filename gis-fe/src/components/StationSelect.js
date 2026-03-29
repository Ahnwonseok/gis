import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../api/axiosInstance';
import {
  isFavoriteStation,
  toggleFavoriteStation,
} from '../utils/favoriteStationsStorage';

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
  /* BackButton 옆에서 잘리지 않게 공간 양보 */
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
  /* 모바일에서 버튼이 화면 밖으로 밀리지 않게 */
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

const StationInfoTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const StationTextBlock = styled.div`
  flex: 1;
  min-width: 0;
`;

const FavoriteButton = styled.button`
  flex-shrink: 0;
  padding: 10px 14px;
  font-size: 1rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 215, 0, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 215, 0, 0.4);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 8px 10px;
    font-size: 0.9rem;
  }
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
  const [favorited, setFavorited] = useState(() =>
    isFavoriteStation(station?.stationID),
  );

  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';

  useEffect(() => {
    setFavorited(isFavoriteStation(station?.stationID));
  }, [station?.stationID]);

  // 정류장 상세 정보 조회
  useEffect(() => {
    let isMounted = true;
    
    const fetchStationDetail = async () => {
      const stationID = station?.stationID;
      if (!stationID) {
        if (isMounted) {
          setError('정류장 ID가 없습니다.');
        }
        return;
      }

      if (!isMounted) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/station/detail', {
          params: {
            stationID: stationID,
          },
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
          const mergedStation = {
            ...station,
            ...data.result,
            busList: data.result.busList || [],
          };
          if (isMounted) {
            setStationDetail(mergedStation);
            setLoading(false);
          }
        } else {
          if (isMounted) {
            setError('정류장 상세 정보를 찾을 수 없습니다.');
            setLoading(false);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('정류장 상세 정보 조회 오류:', err);
        if (err.response) {
          setError(`서버 오류가 발생했습니다. (${err.response.status})`);
        } else if (err.request) {
          setError('서버에 연결할 수 없습니다.');
        } else {
          setError('정류장 정보를 가져오는 중 오류가 발생했습니다.');
        }
        setLoading(false);
      }
    };

    fetchStationDetail();
    
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?.stationID]);

  const handleSelect = (type) => {
    // 상세 정보가 로드된 경우 상세 정보를 전달, 아니면 기본 정보만 전달
    const stationToSend = stationDetail || station;
    console.log('StationSelect - handleSelect:', type);
    console.log('StationSelect - stationDetail:', stationDetail);
    console.log('StationSelect - station:', station);
    console.log('StationSelect - stationToSend:', stationToSend);
    console.log('StationSelect - stationToSend.busList:', stationToSend?.busList);
    if (!stationToSend) {
      console.error('정류장 정보가 없습니다.');
      return;
    }
    if (onSelect) {
      onSelect(type, stationToSend);
    }
  };

  const handleFavoriteClick = () => {
    const sid = station?.stationID;
    if (!sid) return;
    const name =
      stationDetail?.stationName ||
      stationDetail?.name ||
      stationName;
    const dir =
      stationDetail?.direction != null && stationDetail?.direction !== ''
        ? stationDetail.direction
        : direction;
    const next = toggleFavoriteStation({
      stationID: sid,
      stationName: name,
      direction: dir,
    });
    setFavorited(next);
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
        <StationInfoTop>
          <StationTextBlock>
            <StationName>{stationName}</StationName>
            {direction && (
              <StationDirection>→ {direction} 방면</StationDirection>
            )}
          </StationTextBlock>
          <FavoriteButton
            type="button"
            onClick={handleFavoriteClick}
            aria-pressed={favorited}
            aria-label={favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            disabled={!station?.stationID}
          >
            {favorited ? '★ 즐겨찾기' : '☆ 즐겨찾기'}
          </FavoriteButton>
        </StationInfoTop>
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

