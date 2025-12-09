import React, { useState } from 'react';
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
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
`;

const StationDirection = styled.div`
  font-size: 1.2rem;
  color: white;
  opacity: 0.9;
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto 30px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 20px;
  font-size: 1.5rem;
  border: 3px solid white;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  box-sizing: border-box;

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 4px;
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  width: 100%;
  min-height: 80px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  padding: 20px;
  margin-top: 20px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const ResultCard = styled.div`
  width: 100%;
  padding: 25px;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
`;

const BusNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
`;

const RouteInfo = styled.div`
  font-size: 1.3rem;
  color: white;
  margin-bottom: 10px;
  line-height: 1.6;
`;

const StationCount = styled.div`
  font-size: 1.1rem;
  color: white;
  opacity: 0.8;
  margin-top: 10px;
`;

const NoResultMessage = styled.div`
  text-align: center;
  color: white;
  font-size: 1.5rem;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
`;

const DestinationSearch = ({ station, onBack }) => {
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const stationName = station?.stationName || station?.name || '정류장명 없음';
  const direction = station?.direction || '';
  const busList = station?.busList || [];

  // 도착지 검색 로직
  const handleSearch = () => {
    if (!destination.trim()) {
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    const departureStationID = station?.stationID;
    if (!departureStationID) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const results = [];

    // 각 버스의 노선에서 도착지 검색
    busList.forEach(bus => {
      const laneDetail = bus.laneDetail;
      if (!laneDetail || !laneDetail.station || !Array.isArray(laneDetail.station)) {
        return;
      }

      const stations = laneDetail.station;
      
      // 출발 정류장과 도착 정류장 찾기
      let departureIdx = -1;
      let arrivalIdx = -1;

      // 검색어 정규화 (공백 제거)
      const searchTerm = destination.trim();
      console.log('검색어:', searchTerm, '길이:', searchTerm.length);
      
      // 먼저 출발 정류장 찾기
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        if (station.stationID === departureStationID) {
          departureIdx = i;
          console.log(`출발 정류장 찾음: ${station.stationName} (배열 인덱스: ${departureIdx})`);
          break;
        }
      }
      
      // 출발 정류장을 찾지 못하면 다음 버스로
      if (departureIdx === -1) {
        console.log(`❌ 버스 ${bus.busNo}: 출발 정류장을 찾을 수 없음`);
        return;
      }
      
      // 도착 정류장 찾기: 출발 정류장보다 뒤에 있는 정류장을 우선적으로 찾음
      const matchingStations = []; // 매칭되는 모든 정류장 인덱스
      
      for (let i = 0; i < stations.length; i++) {
        const station = stations[i];
        
        if (station.stationName) {
          // 정류장명 정규화 (모든 공백 제거, 앞뒤 공백 제거)
          const stationName = String(station.stationName).trim();
          
          // 검색어와 정류장명을 모두 정규화하여 비교
          const normalizedStationName = stationName.replace(/\s+/g, '');
          const normalizedSearchTerm = searchTerm.replace(/\s+/g, '');
          
          // 디버깅: 처음 10개만 상세 로그
          if (i < 10 && searchTerm.length > 0) {
            const isMatch = normalizedStationName.includes(normalizedSearchTerm);
            console.log(`[${i}] 원본: "${stationName}" | 정규화: "${normalizedStationName}" | 검색어: "${normalizedSearchTerm}" | 매칭: ${isMatch}`);
          }
          
          // 정규화된 문자열로 포함 검색
          if (normalizedStationName.includes(normalizedSearchTerm)) {
            matchingStations.push(i);
            console.log(`✅ 매칭 발견: ${stationName} (배열 인덱스: ${i})`);
          }
        }
      }
      
      // 출발 정류장보다 뒤에 있는 정류장만 선택 (버스는 앞으로만 이동하므로)
      const stationsAfterDeparture = matchingStations.filter(idx => idx > departureIdx);
      if (stationsAfterDeparture.length > 0) {
        arrivalIdx = Math.min(...stationsAfterDeparture);
        console.log(`✅ 도착 정류장 선택 (출발 이후): ${stations[arrivalIdx].stationName} (배열 인덱스: ${arrivalIdx})`);
      } else {
        // 출발 정류장 이후에 도착 정류장이 없으면 결과에 포함하지 않음
        console.log(`❌ 버스 ${bus.busNo}: 출발 정류장 이후에 도착 정류장이 없음`);
      }

      // 디버깅: 인덱스 값 확인
      console.log(`버스 ${bus.busNo}: departureIdx=${departureIdx}, arrivalIdx=${arrivalIdx}`);
      
      if (departureIdx === -1 || arrivalIdx === -1) {
        if (departureIdx === -1) {
          console.log(`❌ 버스 ${bus.busNo}: 출발 정류장을 찾을 수 없음`);
        } else {
          console.log(`❌ 버스 ${bus.busNo}: 도착 정류장을 찾을 수 없음`);
        }
        return;
      }

      const turningPointIdx = laneDetail.turningPointIdx !== undefined ? laneDetail.turningPointIdx : stations.length;
      console.log(`버스 ${bus.busNo}: turningPointIdx=${turningPointIdx}, departureIdx=${departureIdx}, arrivalIdx=${arrivalIdx}`);
      
      let stationCount = -1;
      let isValidRoute = false;

      // 케이스 1: 출발 정류장이 도착 정류장보다 앞에 있는 경우 (배열 순서상)
      if (departureIdx < arrivalIdx) {
        // 출발과 도착이 모두 회차점 이전에 있는 경우
        if (arrivalIdx <= turningPointIdx) {
          stationCount = arrivalIdx - departureIdx;
          isValidRoute = true;
          console.log(`✅ 버스 ${bus.busNo} 케이스1: 정상 경로 (${stationCount}개 정류장)`);
        }
        // 출발과 도착이 모두 회차점 이후에 있는 경우
        else if (departureIdx > turningPointIdx && arrivalIdx > turningPointIdx) {
          stationCount = arrivalIdx - departureIdx;
          isValidRoute = true;
          console.log(`✅ 버스 ${bus.busNo} 케이스2: 회차점 이후 경로 (${stationCount}개 정류장)`);
        }
        // 출발은 회차점 이전, 도착은 회차점 이후 (불가능)
        else {
          console.log(`❌ 버스 ${bus.busNo}: 출발은 회차점 이전, 도착은 회차점 이후 (불가능)`);
        }
      }
      // 케이스 3: 출발 정류장이 도착 정류장보다 뒤에 있는 경우 (순환 노선 고려)
      else if (departureIdx > arrivalIdx) {
        // 출발과 도착이 모두 회차점 이후에 있는 경우 (순환 경로)
        if (departureIdx > turningPointIdx && arrivalIdx > turningPointIdx) {
          // 순환 경로: 출발 정류장 -> 배열 끝 -> 배열 시작 -> 도착 정류장
          stationCount = (stations.length - departureIdx) + arrivalIdx;
          isValidRoute = true;
          console.log(`✅ 버스 ${bus.busNo} 케이스3: 회차점 이후 순환 경로 (${stationCount}개 정류장)`);
        }
        // 출발이 회차점 이후, 도착이 회차점 이전 (순환 경로)
        else if (departureIdx > turningPointIdx && arrivalIdx <= turningPointIdx) {
          stationCount = (stations.length - departureIdx) + arrivalIdx;
          isValidRoute = true;
          console.log(`✅ 버스 ${bus.busNo} 케이스4: 순환 경로 (${stationCount}개 정류장)`);
        }
        // 출발과 도착이 모두 회차점 이전 (불가능)
        else {
          console.log(`❌ 버스 ${bus.busNo}: 출발이 도착보다 뒤에 있지만 모두 회차점 이전 (불가능)`);
        }
      }
      // 케이스 5: 출발 정류장과 도착 정류장이 같은 경우
      else {
        console.log(`❌ 버스 ${bus.busNo}: 출발 정류장과 도착 정류장이 같음`);
      }

      if (isValidRoute && stationCount > 0) {
        console.log(`✅ 버스 ${bus.busNo} 결과 추가: ${stationCount}개 정류장`);
        results.push({
          bus: bus,
          stationCount: stationCount,
          departureIdx: departureIdx,
          arrivalIdx: arrivalIdx,
          arrivalStationName: stations[arrivalIdx].stationName
        });
      }
    });

    // 정류장 개수가 가장 적은 순으로 정렬 (가장 빠른 노선)
    results.sort((a, b) => a.stationCount - b.stationCount);

    setSearchResults(results);
    setIsSearching(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container>
      <Header>
        <Title>도착지 검색</Title>
        <BackButton onClick={onBack}>
          ← 뒤로
        </BackButton>
      </Header>

      <StationInfo>
        <StationName>출발: {stationName}</StationName>
        {direction && (
          <StationDirection>→ {direction} 방면</StationDirection>
        )}
      </StationInfo>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="도착지 정류장명을 입력하세요"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SearchButton 
          onClick={handleSearch}
          disabled={isSearching || !destination.trim()}
        >
          {isSearching ? '검색 중...' : '검색'}
        </SearchButton>
      </SearchContainer>

      <ResultContainer>
        {searchResults !== null && (
          <>
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <ResultCard key={`${result.bus.busID}-${index}`}>
                  <BusNumber>{result.bus.busNo}번 버스</BusNumber>
                  <RouteInfo>
                    출발: {stationName}
                  </RouteInfo>
                  <RouteInfo>
                    도착: {result.arrivalStationName}
                  </RouteInfo>
                  <StationCount>
                    {result.stationCount}개 정류장 경유
                  </StationCount>
                </ResultCard>
              ))
            ) : (
              <NoResultMessage>
                {destination.trim() ? 
                  '도착지로 가는 직행 버스가 없습니다.' : 
                  '도착지를 입력해주세요.'}
              </NoResultMessage>
            )}
          </>
        )}
      </ResultContainer>
    </Container>
  );
};

export default DestinationSearch;

