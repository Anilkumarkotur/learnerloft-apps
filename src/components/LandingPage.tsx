import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { nanoid } from 'nanoid';
import TodoModal from './TodoModal';

// Styled components
const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing-unit) * 4);
`;

const AppLogo = styled.div`
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit));
  color: var(--primary-color);
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--spacing-unit) * 3);
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: calc(var(--spacing-unit) * 2);
  }
`;

const Section = styled.section`
  margin-bottom: calc(var(--spacing-unit) * 4);
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: calc(var(--spacing-unit) * 2);
  font-size: 20px;
  font-weight: 500;
  color: var(--text-primary);
  padding-bottom: calc(var(--spacing-unit));
  border-bottom: 1px solid var(--border-color);
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: calc(var(--spacing-unit) * 2);
`;

const Card = styled.div`
  background-color: var(--surface-color);
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 3);
  box-shadow: var(--elevation-1);
  transition: box-shadow var(--transition-speed), transform var(--transition-speed);
  cursor: pointer;
  
  &:hover {
    box-shadow: var(--elevation-2);
    transform: translateY(-2px);
  }
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--primary-color);
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: calc(var(--spacing-unit));
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
`;

const CardDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--surface-color);
  padding: calc(var(--spacing-unit) * 4);
  border-radius: var(--border-radius);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--elevation-4);
  
  @media (max-width: 768px) {
    width: 95%;
    padding: calc(var(--spacing-unit) * 2);
  }
`;

const ModalTitle = styled.h2`
  margin-top: 0;
  margin-bottom: calc(var(--spacing-unit) * 2);
  color: var(--text-primary);
`;

const InputField = styled.input`
  width: 100%;
  padding: calc(var(--spacing-unit) * 1.5);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  margin-bottom: calc(var(--spacing-unit) * 2);
  font-size: 16px;
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: calc(var(--spacing-unit) * 3);
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 3);
  background: ${props => props.primary ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.primary ? 'var(--text-on-primary)' : 'var(--primary-color)'};
  border: none;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-speed);
  
  &:hover {
    background: ${props => props.primary ? 'var(--primary-dark)' : 'rgba(29, 185, 84, 0.1)'};
  }
  
  &:disabled {
    background: ${props => props.primary ? 'rgba(29, 185, 84, 0.5)' : 'transparent'};
    color: ${props => props.primary ? 'var(--text-on-primary)' : 'rgba(29, 185, 84, 0.5)'};
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  display: flex;
  align-items: center;
  padding: calc(var(--spacing-unit) * 1.5);
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius);
  font-family: monospace;
  margin-bottom: calc(var(--spacing-unit) * 2);
  overflow-x: auto;
  white-space: nowrap;
`;

const CopyButton = styled.button`
  margin-left: auto;
  padding: calc(var(--spacing-unit)) calc(var(--spacing-unit) * 2);
  background-color: transparent;
  border: none;
  border-radius: var(--border-radius);
  color: var(--primary-color);
  cursor: pointer;
  flex-shrink: 0;
  
  &:hover {
    background-color: rgba(29, 185, 84, 0.1);
  }
  
  &.success {
    color: #4caf50;
  }
`;

// Icons
const RetroIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M11 17H7V13H11V17Z" fill="currentColor"/>
    <path d="M17 13H13V7H17V13Z" fill="currentColor"/>
    <path d="M11 11H7V7H11V11Z" fill="currentColor"/>
  </svg>
);

const JsonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M7 12H9V18H7V12Z" fill="currentColor"/>
    <path d="M11 10H13V18H11V10Z" fill="currentColor"/>
    <path d="M15 14H17V18H15V14Z" fill="currentColor"/>
  </svg>
);

const QuizIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

const TodoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
  </svg>
);

const GanttIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 7h5v12H7z" />
    <path d="M15 10h3v9h-3z" />
  </svg>
);

const LandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardLink, setBoardLink] = useState('');
  const [boardName, setBoardName] = useState('Team Retrospective');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTodoModal, setShowTodoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  const generateBoardLink = () => {
    // Generate a unique ID for the board
    const uniqueId = nanoid(10);
    // Create the full board link
    const fullLink = `${window.location.origin}/retro/${uniqueId}`;
    setBoardLink(fullLink);
    setBoardName('Team Retrospective'); // Default name
    setIsModalOpen(true);
    return fullLink;
  };
  
  const generateKanbanBoardLink = () => {
    // Generate a unique board ID
    const boardId = nanoid(10);
    const link = `${window.location.origin}/kanban-board/${boardId}`;
    setBoardLink(link);
    setBoardName('My Kanban Board'); // Default name
    setIsModalOpen(true);
  };
  
  const copyToClipboard = () => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = boardLink;
      // Make the textarea out of viewport
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      // Select and copy
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      // Clean up
      document.body.removeChild(textarea);
      
      // Visual feedback
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };
  
  const redirectToBoard = () => {
    // Extract board ID from link
    const boardId = boardLink.split('/').pop();
    
    // Save board name to localStorage
    if (boardId && boardName.trim()) {
      if (boardLink.includes('kanban')) {
        localStorage.setItem(`kanban-name-${boardId}`, boardName.trim());
      } else {
        localStorage.setItem(`board-name-${boardId}`, boardName.trim());
      }
    }
    
    // Navigate to the board using React Router
    if (boardLink.includes('kanban')) {
      navigate(`/kanban-board/${boardId}`);
    } else {
      navigate(`/retro/${boardId}`);
    }
  };

  const handleTodoCardClick = () => {
    setShowTodoModal(true);
  };

  const handleCreateTodoList = () => {
    navigate('/todo-list');
    setShowTodoModal(false);
  };
  
  const handleQuizCardClick = () => {
    setShowQuizModal(true);
  };
  
  const handleCreateQuiz = () => {
    setShowQuizModal(false);
    navigate('/quiz-creator');
  };

  return (
    <PageContainer>
      <Header>
        <AppLogo>
          <RetroIcon />
          <Title>Engineering Hub</Title>
        </AppLogo>
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
      </Header>
      
      <ContentContainer>
        <Section>
          <SectionTitle>Engineering Tools</SectionTitle>
          <CardGrid>
            <Card onClick={() => navigate('/json-formatter')}>
              <CardIcon>
                <JsonIcon />
              </CardIcon>
              <CardTitle>JSON Formatter</CardTitle>
              <CardDescription>
                Format, validate, and beautify your JSON with this easy-to-use tool.
              </CardDescription>
            </Card>
            
            <Card onClick={() => navigate('/code-diff-viewer')}>
              <CardIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6Z" fill="currentColor"/>
                  <path d="M14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="currentColor"/>
                </svg>
              </CardIcon>
              <CardTitle>Code Diff Viewer</CardTitle>
              <CardDescription>
                Compare code snippets and visualize differences between versions.
              </CardDescription>
            </Card>
            
            <Card onClick={() => navigate('/markdown-editor')}>
              <CardIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z" fill="currentColor" fillOpacity="0.2"/>
                  <path d="M13 9V3.5L18.5 9H13Z" fill="currentColor"/>
                  <path d="M8 12H16V14H8V12Z" fill="currentColor"/>
                  <path d="M8 16H16V18H8V16Z" fill="currentColor"/>
                </svg>
              </CardIcon>
              <CardTitle>Markdown Editor</CardTitle>
              <CardDescription>
                Write and preview markdown with real-time rendering.
              </CardDescription>
            </Card>
          </CardGrid>
        </Section>
        
        <Section>
          <SectionTitle>Team Management</SectionTitle>
          <CardGrid>
            <Card onClick={generateBoardLink}>
              <CardIcon>
                <RetroIcon />
              </CardIcon>
              <CardTitle>Retrospective Board</CardTitle>
              <CardDescription>
                Collaborate with your team on retrospectives. Create a shared board and collect feedback.
              </CardDescription>
            </Card>
            
            <Card onClick={handleQuizCardClick}>
              <CardIcon>
                <QuizIcon />
              </CardIcon>
              <CardTitle>Team Quiz</CardTitle>
              <CardDescription>
                Create interactive quizzes for team building and knowledge testing.
              </CardDescription>
            </Card>
            
            <Card onClick={handleTodoCardClick} data-testid="todo-list-card">
              <CardIcon>
                <TodoIcon />
              </CardIcon>
              <CardTitle>Todo list</CardTitle>
              <CardDescription>
                Manage tasks and track progress with a collaborative to-do list.
              </CardDescription>
            </Card>
          </CardGrid>
        </Section>
        
        <Section>
          <SectionTitle>Project Planning</SectionTitle>
          <CardGrid>
            <Card>
              <CardIcon>
                <GanttIcon />
              </CardIcon>
              <CardTitle>Gantt Chart</CardTitle>
              <CardDescription>
                Visualize project timelines and dependencies with an interactive Gantt chart.
              </CardDescription>
            </Card>
            
            <Card onClick={() => navigate('/kanban-board')}>
              <CardIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor"/>
                  <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor"/>
                </svg>
              </CardIcon>
              <CardTitle>Kanban Board</CardTitle>
              <CardDescription>
                Manage your project workflow with a flexible kanban board.
              </CardDescription>
            </Card>
            
            <Card onClick={generateKanbanBoardLink}>
              <CardIcon>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="currentColor" fillOpacity="0.2"/>
                  <path d="M11 17H7V13H11V17Z" fill="currentColor"/>
                  <path d="M17 13H13V7H17V13Z" fill="currentColor"/>
                  <path d="M11 11H7V7H11V11Z" fill="currentColor"/>
                </svg>
              </CardIcon>
              <CardTitle>Create Custom Board</CardTitle>
              <CardDescription>
                Create a customized board with your preferred columns and workflow.
              </CardDescription>
            </Card>
          </CardGrid>
        </Section>
      </ContentContainer>
      
      {isModalOpen && (
        <Modal onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Create {boardLink.includes('kanban') ? 'Kanban' : 'Retrospective'} Board</ModalTitle>
            
            <p>Name your {boardLink.includes('kanban') ? 'kanban' : 'retrospective'} board:</p>
            <InputField 
              type="text" 
              value={boardName} 
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Enter board name"
              autoFocus
            />
            
            <p>Share this link with your team members to collaborate on the {boardLink.includes('kanban') ? 'kanban' : 'retrospective'} board:</p>
            
            <LinkContainer>
              {boardLink}
              <CopyButton 
                onClick={copyToClipboard} 
                title="Copy to clipboard"
                className={copySuccess ? 'success' : ''}
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </CopyButton>
            </LinkContainer>
            
            <p>Only people with this link will be able to access the board.</p>
            
            <ButtonGroup>
              <Button onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button primary onClick={redirectToBoard}>
                Go to Board
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {showTodoModal && (
        <Modal onClick={() => setShowTodoModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Create Todo List</ModalTitle>
            <p>Create a new todo list to track tasks and assign them to team members.</p>
            
            <ButtonGroup>
              <Button onClick={() => setShowTodoModal(false)}>Cancel</Button>
              <Button primary onClick={handleCreateTodoList}>Create Todo List</Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
      
      {showQuizModal && (
        <Modal onClick={() => setShowQuizModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Create a Team Quiz</ModalTitle>
            <p>Create interactive quizzes for your team. Test knowledge, have fun, and track results!</p>
            <ButtonGroup>
              <Button onClick={() => setShowQuizModal(false)}>Cancel</Button>
              <Button primary onClick={handleCreateQuiz}>Create Quiz</Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default LandingPage; 