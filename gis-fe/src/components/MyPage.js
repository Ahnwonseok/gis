import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  getFavoriteStations,
  removeFavoriteStation,
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

const SectionTitle = styled.h2`
  font-size: 1.35rem;
  font-weight: bold;
  color: white;
  margin: 0 0 16px;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.25);
`;

const List = styled.ul`
  list-style: none;
  margin: 0 auto;
  padding: 0;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.li`
  display: flex;
  gap: 10px;
  align-items: stretch;
`;

const StationOpenButton = styled.button`
  flex: 1;
  min-height: 88px;
  font-size: 1.25rem;
  font-weight: bold;
  color: white;
  text-align: left;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  padding: 16px 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 2px;
  }
`;

const StationMeta = styled.div`
  font-size: 0.95rem;
  font-weight: normal;
  opacity: 0.9;
  margin-top: 6px;
  line-height: 1.35;
`;

const RemoveButton = styled.button`
  min-width: 52px;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 80, 80, 0.35);
  border: 3px solid white;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 80, 80, 0.55);
  }

  &:focus {
    outline: 4px solid #ffd700;
    outline-offset: 2px;
  }
`;

const EmptyMessage = styled.p`
  color: white;
  text-align: center;
  font-size: 1.2rem;
  opacity: 0.95;
  max-width: 500px;
  margin: 24px auto 0;
  line-height: 1.5;
`;

const MyPage = ({ onBack, onOpenStation }) => {
  const [favorites, setFavorites] = useState(() => getFavoriteStations());

  const refresh = useCallback(() => {
    setFavorites(getFavoriteStations());
  }, []);

  const handleRemove = (e, stationID) => {
    e.stopPropagation();
    removeFavoriteStation(stationID);
    refresh();
  };

  const handleOpen = (item) => {
    if (!onOpenStation) return;
    onOpenStation({
      stationID: item.stationID,
      stationName: item.stationName,
      direction: item.direction || '',
    });
  };

  return (
    <Container>
      <Header>
        <Title>마이페이지</Title>
        <BackButton type="button" onClick={onBack} aria-label="메인으로 돌아가기">
          뒤로
        </BackButton>
      </Header>

      <SectionTitle id="fav-heading">즐겨찾는 정류장</SectionTitle>
      {favorites.length === 0 ? (
        <EmptyMessage>
          저장된 정류장이 없습니다.
          <br />
          정류장 화면에서 ☆ 즐겨찾기를 눌러 추가할 수 있습니다.
        </EmptyMessage>
      ) : (
        <List aria-labelledby="fav-heading">
          {favorites.map((item) => (
            <ListItem key={String(item.stationID)}>
              <StationOpenButton
                type="button"
                onClick={() => handleOpen(item)}
                aria-label={`${item.stationName} 정류장 열기`}
              >
                <span>{item.stationName}</span>
                {item.direction ? (
                  <StationMeta>→ {item.direction} 방면</StationMeta>
                ) : null}
              </StationOpenButton>
              <RemoveButton
                type="button"
                onClick={(e) => handleRemove(e, item.stationID)}
                aria-label={`${item.stationName} 즐겨찾기 삭제`}
                title="삭제"
              >
                ×
              </RemoveButton>
            </ListItem>
          ))}
        </List>
      )}
    </Container>
  );
};

export default MyPage;
