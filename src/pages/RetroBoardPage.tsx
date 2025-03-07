import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Board from '../components/Board';

const AppBar = styled.header`
  background-color: var(--primary-color);
  color: var(--text-on-primary);
  padding: calc(var(--spacing-unit) * 2);
  box-shadow: var(--elevation-2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 64px;
  position: relative;
  z-index: 10;
`;

const AppTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-on-primary);
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const HomeButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 8px 12px;
  margin-right: 8px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const BoardContainer = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const RetroBoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [boardName, setBoardName] = useState('Team Retrospective');
  const navigate = useNavigate();
  
  console.log('RetroBoardPage rendering with boardId:', boardId);
  
  useEffect(() => {
    // Check if boardId exists
    if (!boardId) {
      console.error('No boardId in URL params');
      navigate('/');
      return;
    }
    
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Load board name from localStorage if it exists
    const savedBoardName = localStorage.getItem(`board-name-${boardId}`);
    if (savedBoardName) {
      console.log('Found saved board name:', savedBoardName);
      setBoardName(savedBoardName);
    }
  }, [boardId, navigate]);
  
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="currentColor"/>
    </svg>
  );

  if (!boardId) {
    return <div>Loading...</div>;
  }

  console.log('About to render Board with boardId:', boardId);

  return (
    <PageContainer>
      <AppBar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <HomeButton onClick={() => navigate('/')}>
            <HomeIcon />
          </HomeButton>
          <AppTitle>{boardName}</AppTitle>
        </div>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </AppBar>
      
      <BoardContainer>
        <Board boardId={boardId} />
      </BoardContainer>
    </PageContainer>
  );
};

export default RetroBoardPage; 