import React from 'react';
import styled from 'styled-components';

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
  // 이제 첫 요청에서 모든 정보가 포함되어 있으므로 별도 API 호출 불필요
  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';

  const handleSelect = (type) => {
    // station 객체를 그대로 전달 (이미 모든 정보 포함)
    onSelect(type, station);
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

      <MenuButtonContainer role="menu" aria-label="정류장 메뉴">
        <MenuButton 
          onClick={() => handleSelect('bus')}
          role="menuitem"
          aria-label="버스 선택 메뉴"
        >
          1. 버스 선택
        </MenuButton>
        <MenuButton 
          onClick={() => handleSelect('destination')}
          role="menuitem"
          aria-label="도착지 검색 메뉴"
        >
          2. 도착지 검색
        </MenuButton>
      </MenuButtonContainer>
    </Container>
  );
};

export default StationSelect;

