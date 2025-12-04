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
  margin: 0 auto 30px;
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

const BusListContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const BusButton = styled.button`
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

const EmptyMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const BusSelect = ({ station, onBack, onBusSelect }) => {
  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';
  const busList = station?.busList || [];

  // 중복 제거 및 버스번호순 정렬
  const uniqueBuses = busList
    .filter((bus, index, self) => 
      index === self.findIndex(b => b.busNo === bus.busNo)
    )
    .sort((a, b) => {
      // 버스번호를 숫자와 문자열로 분리하여 정렬
      const numA = parseInt(a.busNo) || 9999;
      const numB = parseInt(b.busNo) || 9999;
      if (numA !== numB) return numA - numB;
      return a.busNo.localeCompare(b.busNo);
    });

  const handleBusClick = (bus) => {
    if (onBusSelect) {
      onBusSelect(bus, station);
    }
  };

  return (
    <Container>
      <Header>
        <Title>버스 선택</Title>
        <BackButton onClick={onBack}>
          ← 뒤로
        </BackButton>
      </Header>

      <StationInfo>
        <StationName>{stationName}</StationName>
        {direction && (
          <StationDirection>→ {direction} 방면</StationDirection>
        )}
      </StationInfo>

      {uniqueBuses.length > 0 ? (
        <BusListContainer>
          {uniqueBuses.map((bus, index) => (
            <BusButton
              key={`${bus.busID}-${index}`}
              onClick={() => handleBusClick(bus)}
            >
              {bus.busNo}번
            </BusButton>
          ))}
        </BusListContainer>
      ) : (
        <EmptyMessage>
          이 정류장에 운행하는 버스가 없습니다.
        </EmptyMessage>
      )}
    </Container>
  );
};

export default BusSelect;

