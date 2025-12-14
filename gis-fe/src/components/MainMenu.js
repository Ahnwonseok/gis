import React from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
`;

const MenuTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 60px;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 40px;
  }
`;

const MenuButton = styled.button`
  width: 100%;
  max-width: 500px;
  min-height: 100px;
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid white;
  border-radius: 15px;
  margin: 15px 0;
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

const MenuButtonContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MainMenu = ({ onMenuSelect }) => {
  const handleMenuClick = (menu) => {
    // 부모 컴포넌트에 메뉴 선택 알림
    // 토크백이 자동으로 읽어주므로 별도 TTS는 불필요
    if (onMenuSelect) {
      onMenuSelect(menu);
    }
  };

  return (
    <MenuContainer>
      <MenuTitle>버스 알리미</MenuTitle>
      <MenuButtonContainer>
        <MenuButton
          onClick={() => handleMenuClick('정류장 확인')}
          aria-label="근처 정류장 찾기 메뉴"
        >
          근처 정류장 찾기
        </MenuButton>
        <MenuButton
          onClick={() => handleMenuClick('위치공유')}
          aria-label="위치공유 메뉴"
        >
          위치공유
        </MenuButton>
        <MenuButton
          onClick={() => handleMenuClick('마이페이지')}
          aria-label="마이페이지 메뉴"
        >
          마이페이지
        </MenuButton>
      </MenuButtonContainer>
    </MenuContainer>
  );
};

export default MainMenu;

